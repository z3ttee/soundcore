import { Controller, Get } from "@nestjs/common";
import { PipelineRegistry } from "../services/pipeline-registry.service";

@Controller("pipelines")
export class PipelineController {

    constructor(
        private readonly registry: PipelineRegistry
    ) {}

    @Get("definitions")
    public async findPipelineDefinitions() {
        return this.registry.listAll();
    }

}