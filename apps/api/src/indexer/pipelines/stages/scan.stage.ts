import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import glob from "glob";
import { DataSource } from "typeorm";
import { Mount } from "../../../mount/entities/mount.entity";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { MountRegistryService } from "../../../mount/services/mount-registry.service";
import { MountRegistry } from "../../../mount/entities/mount-registry.entity";
import { FileDTO } from "../../../file/dto/file.dto";
import { Batch } from "@soundcore/common";
import { File } from "../../../file/entities/file.entity";
import { FileService } from "../../../file/services/file.service";
import { STAGE_SCAN_ID, STEP_CHECKOUT_MOUNT_ID } from "../../pipelines";
import { get, getOrDefault, progress, set, StepParams } from "@soundcore/pipelines";

/**
 * Checkout mount using the id provided via env.
 * @param step Current step to write result
 * @param env Environment containing the mountId
 * @param datasource Datasource used for database connection
 * @param logger Logger instance
 */
export async function step_checkout_mount(params: StepParams) {
    const { environment, logger, resources, step } = params;
    const datasource: DataSource = resources.datasource;

    // Step preparation
    const mountId = environment.mountId;
    logger.info(`Checking out mount using id '${mountId}'`);
    const repository = datasource.getRepository(Mount);

    if(typeof mountId === "undefined" || mountId == null) {
        step.abort(`mountId is a required environment variable. Received: ${mountId}`);
        return;
    }
            
    // Find mount in database
    const mount = await repository.findOneOrFail({
        where: { id: mountId },
        relations: ["zone"]
    }).catch((error: Error) => {
        throw error;
    });

    // Step cleanup
    const result = set("mount", mount);
    logger.info(`Checked out mount '${result?.name}'`);
}

/**
 * Lookup files after the mount was checked-out.
 * @param stage Current pipeline stage to read result of previous step
 * @param step Current step to write results
 * @param env Environment
 * @param logger Logger instance
 */
export async function step_search_files(params: StepParams) {
    const { environment, logger, step } = params;
    
    // Step preparation
    const mount = get(`${STAGE_SCAN_ID}.${STEP_CHECKOUT_MOUNT_ID}.mount`);

    return;

    const fsService = new FileSystemService();
    const registryService = new MountRegistryService(fsService);
    logger.info(`Started file lookup on mount '${mount.name}'`);

    // Resolving mount directory
    const directory = fsService.resolveMountPath(mount);
    logger.info(`Using directory '${directory}'`);

    // Create directory if it does not exist.
    if(!fs.existsSync(directory)) {
        logger.warn(`Could not find directory '${directory}'. Creating it...`);
        fs.mkdirSync(directory, { recursive: true });
    }

    const files = await new Promise<FileDTO[]>(async (resolve, reject) => {
        // Read registry
        let registry: MountRegistry = await registryService.readRegistry(mount);

        if(environment.force) {
            registry = await registryService.resetRegistry(registry);
        }

        // Execute scan
        const files: FileDTO[] = [];
        const matches: string[] = [];
        const globs = glob("**/*.mp3", { cwd: directory }, () => ({}));

        // Listen for match event
        // On every match, create a new object
        // for future processing
        globs.on("match", (match: any) => {
            // Check if files already in registry, if not, add to files list
            // for further processing. Otherwise it will be ignored
            if(!registry.files.includes(match)) {
                // On every match, create object.
                const file = new FileDTO();
                file.directory = path.dirname(match);
                file.filename = path.basename(match);

                files.push(file);
            }
            
            // Always add match to matches array
            matches.push(match);
        })

        // Listen for END event.
        // This will be triggered when matching process is done.
        globs.on("end", () => { 
            // Update registry file entries
            registry.files = matches;
            registryService.saveRegistry(registry).finally(() => {
                resolve(files);
            });
        });

        // Listen for error event
        globs.on("error", (err: Error) => {
            reject(err);
        });
    }).catch((error: Error) => {
        // Redirect error to step
        throw error;
    });

    // Step cleanup
    set("files", files ?? []);
}

/**
 * Create database entries for found files.
 * @param stage Current stage to read outputs from previous step
 * @param step Current step to write to outputs
 * @param env 
 * @param logger Logger instance
 */
export async function step_create_database_entries(params: StepParams) {
    const { environment, logger, step, resources } = params;
    
    // Step preparation
    const datasource: DataSource = resources.datasource;
    const repository = datasource.getRepository(File);
    const fsService = new FileSystemService();
    const service = new FileService(repository);

    const mount: Mount = get(`${STEP_CHECKOUT_MOUNT_ID}.mount`);
    const files: FileDTO[] = getOrDefault(`${STEP_CHECKOUT_MOUNT_ID}.files`, []);

    if(files.length <= 0) {
        step.skip("No files were found in previous steps");
    }

    const mappedFiles: Map<string, File> = new Map();

    return Batch.useDataset<FileDTO, File>(files).onError((error: Error, batch, batchNr) => {
        logger.error(`Error occured whilst processing batch #${batchNr}: ${error.message}`, error.stack);
    }).forEach(async (batch, currentBatch, totalBatches) => {
        // Prepare batch
        const collectedFiles: File[] = [];

        // Update progress
        progress(currentBatch/totalBatches);

        for(const fileDto of batch) {
            const file = new File();
            file.name = fileDto.filename;
            file.directory = fileDto.directory;
            file.mount = {
                id: mount.id,
                directory: mount.directory
            } as Mount;

            // Resolving absolute filepath
            const filepath = fsService.resolveFilepath(file);

            try {
                // Get file stats
                const stats = fs.statSync(filepath, { throwIfNoEntry: true });
                if(!stats) logger.warn(`Could not get file stats for '${filepath}'.`);

                // Set size of the file entity
                file.size = stats?.size || 0;

                // Calculate hash consisting of information
                // that make the file unique
                const pathToHash = `${mount.id}:${file.directory}:${file.name}:${file.size}`;
                // Update hash on file entity
                file.pathHash = crypto.createHash("md5").update(pathToHash, "binary").digest("hex");

                collectedFiles.push(file);
            } catch (error) {
                logger.warn(`Skipping file file ${filepath} because it could not be analyzed: ${error["message"] || error}`);
                continue;
            }
        }

        // This will create files in database but only returns entities that were created
        // via this query and did not exist before
        return service.createIfNotExists(
            collectedFiles, 
            (query, alias) => query.select([`${alias}.id`, `${alias}.name`, `${alias}.directory`, `${alias}.flag`])
        ).then((results) => {
            logger.info(`Successfully created files for batch ${currentBatch} in database`);

            // Create a map of all created files
            for(const file of results) {
                mappedFiles.set(file.id, file);
            }

            return results;
        }).catch((error: Error) => {
            // Somehow creating database entries failed, the only reason can be database connection errors
            // TODO: Remove files from registry to scan them again on next scan
            logger.error(`Failed creating files in database: ${error.message}`, error.stack);
            return [];
        });
    }).then((files) => {
        // Batching completed
        logger.info(`Created ${files.length} files in the database`);
        set("files", mappedFiles);
    }).catch((error: Error) => {
        // Batching failed
        logger.error(`Error occured while creating database entries: ${error.message}`, error.stack);
        throw error;
    });
}