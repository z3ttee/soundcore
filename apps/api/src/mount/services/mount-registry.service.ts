import fs, { constants } from "node:fs/promises";

import { Injectable, Logger } from "@nestjs/common";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { MountRegistry } from "../entities/mount-registry.entity";
import { Mount } from "../entities/mount.entity";
import { Environment } from "@soundcore/common";

@Injectable()
export class MountRegistryService {
    private logger: Logger = new Logger(MountRegistryService.name);

    constructor(
        private readonly filesystem: FileSystemService
    ) {}

    /**
     * Read the registry file of a mount and
     * get an object with all the data.
     * @param mount Mount to read registry in
     * @returns MountRegistry
     */
    public async readRegistry(mount: Mount): Promise<MountRegistry> {
        const filepath: string = this.filesystem.resolveMountRegistryPath(mount);
    
        if(Environment.isDebug) {
            this.logger.debug(`Reading registry file ${filepath}`);
        }

        return fs.access(filepath, constants.R_OK | constants.W_OK).then(() => {
            return fs.readFile(filepath).then((buffer) => {
                const registry: MountRegistry = Object.assign(new MountRegistry(filepath), JSON.parse(buffer.toString()));
                return registry;
            });
        }).catch((error: Error) => {
            this.logger.warn(`Could not read registry for mount. This means looking up files cannot be optimized: ${error.message}. If this is the first time the mount is scanned, this warning is just normal.`);
            return new MountRegistry(filepath);
        });
    }

    /**
     * Save the registry to its file.
     * @param registry Registry data
     * @returns Saved MountRegistry
     */
    public async saveRegistry(registry: MountRegistry): Promise<MountRegistry> {
        if(Environment.isDebug) {
            this.logger.debug(`Saving registry file ${registry.filepath}...`);
        }

        return fs.writeFile(registry.filepath, JSON.stringify(registry)).then(() => {
            return registry;
        }).catch((error: Error) => {
            this.logger.warn(`Could not write file registry. This is not an error but informs about a failed optimisation attempt when looking up files: ${error.message}`);
            return registry;
        })
    }

    public async resetRegistry(registry: MountRegistry): Promise<MountRegistry> {
        if(Environment.isDebug) {
            this.logger.debug(`Resetting registry file ${registry.filepath}...`);
        }

        registry.files = [];
        return this.saveRegistry(registry);
    }

    public async resetRegistryOf(mount: Mount) {
        const filepath = this.filesystem.resolveMountRegistryPath(mount);
        const registry = new MountRegistry(filepath);

        return this.saveRegistry(registry);
    }

}