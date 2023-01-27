import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import glob from "glob";
import { Environment, PipelineLogger, StageRef, StepRef } from "@soundcore/worker";
import { DataSource } from "typeorm";
import { Mount } from "../../../mount/entities/mount.entity";
import { FileSystemService } from "../../../filesystem/services/filesystem.service";
import { MountRegistryService } from "../../../mount/services/mount-registry.service";
import { MountRegistry } from "../../../mount/entities/mount-registry.entity";
import { FileDTO } from "../../../file/dto/file.dto";
import { Batch } from "@soundcore/common";
import { File } from "../../../file/entities/file.entity";
import { FileService } from "../../../file/services/file.service";
import { STEP_CHECKOUT_MOUNT_ID, STEP_LOOKUP_FILES_ID } from "../../pipelines";

/**
 * Checkout mount using the id provided via env.
 * @param step Current step to write result
 * @param env Environment containing the mountId
 * @param datasource Datasource used for database connection
 * @param logger Logger instance
 */
export async function step_checkout_mount(step: StepRef, env: Environment, datasource: DataSource, logger: PipelineLogger) {
    // Step preparation
    const mountId = env.mountId;
    logger.info(`Checking out mount using id '${mountId}'`);
    const repository = datasource.getRepository(Mount);
            
    // Find mount in database
    const mount = await repository.findOneOrFail({
        where: { id: mountId },
        relations: ["zone"]
    });

    // Step cleanup
    logger.info(`Checked out mount '${mount.name}'`);
    step.write("mount", mount);
}

/**
 * Lookup files after the mount was checked-out.
 * @param stage Current pipeline stage to read result of previous step
 * @param step Current step to write results
 * @param env Environment
 * @param logger Logger instance
 */
export async function step_search_files(stage: StageRef, step: StepRef, logger: PipelineLogger) {
    // Step preparation
    const previousOutputs = stage.read(STEP_CHECKOUT_MOUNT_ID);
    const mount = previousOutputs.mount;
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
        const registry: MountRegistry = await registryService.readRegistry(mount);

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
    step.write("files", files ?? []);
}

/**
 * Create database entries for found files.
 * @param stage Current stage to read outputs from previous step
 * @param step Current step to write to outputs
 * @param env 
 * @param logger Logger instance
 */
export async function step_create_database_entries(stage: StageRef, step: StepRef, datasource: DataSource, logger: PipelineLogger) {
    // Step preparation
    const repository = datasource.getRepository(File);
    const fsService = new FileSystemService();
    const service = new FileService(repository);

    const mount: Mount = stage.read(STEP_CHECKOUT_MOUNT_ID)?.mount;
    const files: FileDTO[] = stage.read(STEP_LOOKUP_FILES_ID)?.files ?? [];

    if(files.length <= 0) {
        step.skip("No files were found in previous steps");
    }

    return Batch.useDataset<FileDTO, File>(files).forEach(async (batch, currentBatch, totalBatches) => {
        // Prepare batch
        const collectedFiles: File[] = [];

        // Update progress
        const progress = currentBatch/totalBatches;
        step.progress(progress);

        for(const fileDto of batch) {
            const file = new File();
            file.name = fileDto.filename;
            file.directory = fileDto.directory;
            file.mount = mount;

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
        return service.createFiles(collectedFiles).then((results) => {
            logger.info(`Successfully created files for batch ${currentBatch} in database`);
            return results;
        }).catch((error: Error) => {
            logger.error(`Error occured whilst processing batch ${currentBatch}: ${error.message}`, error.stack);
            return [];
        });
    }).then((files) => {
        logger.info(`Created ${files.length} files in the database`);
        step.write("files", files);
    }).catch((error: Error) => {
        logger.error(`Error occured while creating database entries: ${error.message}`, error.stack);
        throw error;
    });
}