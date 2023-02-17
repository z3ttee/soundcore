# NestJS Pipeline Module
Package for implementing workflows using the pipeline pattern.

## Usage

### Register the Module
First, you need to register the module globally in your `app.module.ts` to create a global
configuration:
```typescript
import { Module } from '@nestjs/common';
import { PipelineModule } from '@soundcore/pipelines';

@Module({
  // ...
  imports: [
    // ...
    PipelineModule.forRoot({
      enableStdout: true,
    }),
    // ...
  ],
})
export class AppModule {}
```

### Register a pipeline
#### Create a new pipeline
Before you can register a pipeline, you have to create a new one. This is done by creating a new script file, that contains a default export. That export statement has to return an instance of either `PipelineConfigurator` or `StageConfigurator` imported from `@soundcore/pipelines`. To understand this better, please see the following example on how to define a pipeline. For that, we create a new file called `my-pipeline.ts` and enter the following lines:

```typescript
import { pipeline } from "@soundcore/pipelines";

export default pipeline("my-pipeline", "My Pipeline Name", "A pipeline description")
    // Define a new stage in the pipeline
    .stage("my-first-stage", "My First Stage Name", "Including a description")
    // Define a new step in the stage
    .step("first-ever-step", "First Ever Step Name", "Another description").run((params) => {
        // Do something
    })
    // Using next(), we return one layer and can now create a new stage
    .next()
    // Create the second stage
    .stage("stage-id-2", "Stage 2")
    // Use useResources() on a stage to initialize needed resources (e.g. returning a database connection)
    // The function has to return an object, that can later be used inside the steps.
    .useResources(() => {
        // Return an object containg a prop called "datasource"
        return Database.connect().then((datasource) => ({ datasource: datasource }));
    })
    // Create a new step in stage 2
    .step("step-in-stage-2", "Stage 2 Step").run((params) => {
        const { resources } = params;
        // Get the previously initialized datasource
        const datasource = resources.datasource;
        // Do something
    })
    .step("step-2", "Step 2")
    // Using a condition, you can evaluate if the step should be skipped based on the previous step's output
    // Return false causes the step to be skipped
    .condition((previousOutput) => /** Return a boolean */).run((params) => {
        // Do something
    })
```
#### Register the pipeline
Registering a pipeline is done by importing the `PipelineModule` in the desired module where the pipeline should belong to.
For example:
```typescript
import { Module } from '@nestjs/common';
import { PipelineModule } from '@soundcore/pipelines';

@Module({
  // ...
  imports: [
    // ...
    PipelineModule.registerPipelines({
      pipelines: [
        // Note: You have to reference the path of the compiled javascript file
        path.join(__dirname, "my-pipeline.pipeline.js")
      ]
    })
    // ...
  ],
})
export class SubModule {}
```
#### Dispatch a new pipeline run
You are now ready to add a new run to the queue. To do that, inject the `PipelineService` into any service registered in the same module as the pipeline is:
```typescript
import { Injectable } from "@nestjs/common";
import { PipelineRun, PipelineService } from "@soundcore/pipelines";

@Injectable()
export class ExampleService {
  constructor(private readonly pipelines: PipelineService) {}

  public async newRun(additionalData: any, anyObject: any): Promise<PipelineRun> {
    return this.pipelines.createRun({
      // ID of the pipeline as defined in my-pipeline.ts
      id: "my-pipeline",
      // Define additional data
      environment: {
        additionalData: additionalData,
        anyObject: anyObject
      }
    });
  }
}
```
Calling the `newRun()` function would now create a new pipeline run in the database and enqueue the run.
After some time, a worker will pick up the run and process the pipeline by executing the script that was 
defined previously.

# Read from previous steps and stages

# Write output

# Post progress of step

# Event Listening
## Built-In Events

## Custom events
