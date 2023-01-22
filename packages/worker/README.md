# NestJS Worker Module
This package contains a basic queue implementation to inject in NestJS projects

## Usage of Pipelines

### 1. Register the Pipeline

```typescript
PipelineModule.registerPipelines({
    // How many pipelines can run concurrently in this module?
    concurrent: 1,
    // What should the type of the workers inside the pipelines be?
    workerType: "process"
},[
    { 
        id: "scan-pipeline", 
        name: "Mount Scan", 
        stages: [
            { 
                id: "test", 
                name: "Test 1", 
                scriptPath: path.join(__dirname, "pipeline", "scan.pipeline.js"), // Path to the compiled js script file
                steps: [
                    { id: "123", name: "Test Step 1" }
                ]
            }
        ]
    }
]),
```

### 2. Create stages

Every stage must be contained in a single file. Every steps that are executed inside a stage share the environment.
That's why you can for example instantiate database connections per stage and share them across steps in the stage.
See how the file "scan.pipeline.ts" may look like:

```typescript
import { runner, StageExecutor } from "@soundcore/worker";

const executor: StageExecutor = async (env, emit) => {
    return runner().step("123", async (step) => {
        step.progress(0.3);
        step.write("success", true);
        step.message("hello world");
    }).build()
}

export default executor;
```

This function declared here returns a `StageExecutor`. The executor contains all the handlers for the steps.
Using the builder-pattern you can register every handler for the steps. Note, that the referenced stepId must be one of the
previously registered steps in your module. Inside the handler you can do anything. Besides writing to the output of a step via
`step.write()` you can also emit custom messages using the `step.message()` function that this stage received as parameter. It is also
possible to provide progress updates with `step.progress()`.
Accessing your environment variables is as easy as calling `process.env`. Note, that the `env` parameter in the stage function only contains the
environment data passed to the pipeline in the module registration or when using `enqueue()` via the service.

### 3. Dispatch pipeline processes

You can trigger new pipeline processes via the included `PipelineService`. After injecting the service
in you desired class, you have access to the `enqueue()` function. This will enqueue the process. Every 10s an idling worker will check
for new requested pipeline processes.

### 4. Listening for events

After injecting the service in your classes, you can register events using `service.on()` function.

## Outputs

Every pipeline, stage or step has its own object containing the output data. Using for example `step.write()` you can write to that object.
The structure of the outputs object is similar to the configuration of the pipeline. For example, when accessing the outputs object
on the pipeline (`pipeline.outputs`) the structure could be like this:
```json
{
    stage1: {
        step1: { ... }
        step2: { ... }
    },
    stage2: {
        step1: { ... }
    }
}
```