import path from "path";
import { WorkerJob } from "./entities/worker-job.entity";
import { Worker } from "./entities/worker.entity";
import { WorkerCompletedEvent } from "./events/workerCompleted.event";
import { WorkerFailedEvent } from "./events/workerFailed.event";
import { WorkerStartedEvent } from "./events/workerStarted.event";

const workerpool = require('workerpool');

// // a deliberately inefficient implementation of the fibonacci sequence
async function executeScript(worker: Worker, jobData: WorkerJob) {   
    // Build execution function
    const execute = async (job: WorkerJob) => {
        const script = path.resolve(worker.script);
        const workerFunction: (job: WorkerJob) => any = require(script)?.default;

        // Throw error if script file does not have a valid default export
        if(typeof workerFunction !== "function") {
            throw new Error(`Could not build worker from script file ${script}: File does not have a default export or does not default export a valid function.`);
        }

        // Emit started event
        workerpool.workerEmit(new WorkerStartedEvent(job));

        // Execute function
        return await workerFunction(job);
    }
        
    try {
        // Create promis from script function
        await execute(jobData).then((result) => {
            // Handle result of worker
            // Emit completed event with the result as payload
            jobData.result = result;
            workerpool.workerEmit(new WorkerCompletedEvent(jobData));
        }).catch((error: Error) => {
            // Catch error and fire failed event
            workerpool.workerEmit(new WorkerFailedEvent(jobData, error));
        });
    } catch (error) {
        workerpool.workerEmit(new WorkerFailedEvent(jobData, error as Error ));
    }

}

// create a worker and register public functions
workerpool.worker({
    default: executeScript
});