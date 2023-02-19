import { PipelineConfigurator } from "../builder/pipeline.builder";
import { StageConfigurator } from "../builder/stage.builder";
import { IPipeline } from "../entities/pipeline.entity";
import { IStage } from "../entities/stage.entity";
import { IStep } from "../entities/step.entity";

export function buildDefinitionsFromFiles(files: string[]) {
    try {
        const definitions: IPipeline[] = [];

        for(const filepath of files) {
            const configurator = readConfiguratorFromFile(filepath);

            const definition: IPipeline = {
                id: configurator["_id"],
                name: configurator["_name"],
                description: configurator["_description"] ?? undefined,
                scriptFile: filepath,
                stages: (configurator["_stages"] ?? []).map((stageConfigurator) => {
                    // Map stages
                    const stageDefinition: IStage = {
                        id: stageConfigurator["_id"],
                        name: stageConfigurator["_name"],
                        description: stageConfigurator["_description"] ?? undefined,
                        dependsOn: stageConfigurator["_dependsOn"] ?? [],
                        steps: (stageConfigurator["_steps"] ?? []).map((stepConfigurator) => {
                            // Map steps
                            const stepDefinition: IStep = {
                                id: stepConfigurator["_id"],
                                name: stepConfigurator["_name"],
                                description: stepConfigurator["_description"]
                            }

                            return stepDefinition;
                        })
                    }

                    return stageDefinition;
                })
            }

            definitions.push(definition);
        }

        return definitions;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export function readConfiguratorFromFile(filepath: string) {
    const configurator: PipelineConfigurator | StageConfigurator = require(filepath)?.default;
    let instance: PipelineConfigurator;

    // Check for valid object type
    if(configurator instanceof PipelineConfigurator) {
        instance = configurator;
    } else if(configurator instanceof StageConfigurator) {
        instance = configurator.next();
    } else {
        throw new Error(`Invalid pipeline: Script file '${filepath}' must have a function as default export returning an instance of PipelineConfigurator or StageConfigurator.`);
    }

    return instance;
}