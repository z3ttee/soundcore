import { Injectable, Logger } from "@nestjs/common";
import { IPipeline } from "../entities/pipeline.entity";

@Injectable()
export class PipelineRegistry {
    private readonly logger = new Logger(PipelineRegistry.name);
    private readonly registry: Map<string, IPipeline> = new Map();
    
    /**
     * Register a new pipeline definition
     * @param id Id of the pipeline
     * @param pipeline Pipeline definition
     */
    public registerPipeline(id: string, pipeline: IPipeline) {
        if(this.registry.has(id)) throw new Error(`Pipeline with id '${id}' already registered`);
        this.registry.set(id, pipeline);
    }

    /**
     * Register a dataset of definitions in the registry
     * @param pipelines Set of pipeline definitions to register
     */
    public registerAll(pipelines: IPipeline[]) {
        if(pipelines.length <= 0) return;

        for(const definition of pipelines) {
            this.registerPipeline(definition.id, definition);
        }

        this.logger.log(`Registered ${pipelines.length} pipeline definitions`);
    }

    /**
     * Remove a pipeline definition from the registry
     * @param id Id of the pipeline to remove entry for
     */
    public unregisterPipeline(id: string) {
        this.registry.delete(id);
    }

    /**
     * Get a copy of the pipeline definition.
     * @param id Id of the pipeline to retrieve definition
     * @returns IPipeline
     */
    public get(id: string): IPipeline {
        const pipelineDefinition = this.registry.get(id);
        if(typeof pipelineDefinition === "undefined" || pipelineDefinition == null) throw new Error(`Pipeline with id '${id}' not registered`);

        return {...pipelineDefinition};
    }

    /**
     * Get a list of all registered pipeline definitions
     * @returns IPipeline[]
     */
    public async listAll(): Promise<IPipeline[]> {
        return Array.from(this.registry.values());
    }

    /**
     * Get amount of currently registered definitions
     */
    public get size(): number {
        return this.registry.size;
    }

}