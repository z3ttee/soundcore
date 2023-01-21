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
        console.log(`executing step ${step.id}`);
        step.outputs = { success: true };

        emit("hello-world", { emitted: true })
    }).build()
}

export default executor;
```

This function declared here returns a `StageExecutor`. The executor contains all the handlers for the steps.
Using the builder-pattern you can register every handler for the steps. Note, that the referenced stepId must be one of the
previously registered steps in your module. Inside the handler you can do anything. Besides writing to the output of a step via
`step.outputs = { /** Your data */ }` you can also emit custom events using the `emit` function that this stage received as parameter.
Accessing your environment variables is as easy as calling `process.env`. Note, that the `env` parameter in the stage function only contains the
environment data passed to the pipeline in the module registration or when using `enqueue()` via the service.

### 3. Dispatch pipeline processes

You can trigger new pipeline processes via the included `PipelineService`. After injecting the service
in you desired class, you have access to the `enqueue()` function. This will enqueue the process. Every 10s an idling worker will check
for new requested pipeline processes.

### 4. Listening for events

TODO
