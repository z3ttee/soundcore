import { workerEmit } from "workerpool";
import { PipelineRun } from "../entities/pipeline.entity";
import { IStage } from "../entities/stage.entity";
import { IStep } from "../entities/step.entity";
import { EventHandlerParams, EventName, WorkerEmitEvent } from "../event/event";

/**
 * Emit a message in a pipeline.
 * This can be used to emit custom events.
 * The emitted message can be handled by registering an event handler
 * for the "pipeline:message" event
 * @param message Message to emit
 */
export function message(message: string) {
    if(!globalThis.pipeline) {
        throw new Error(`Message was emitted outside the scope of a pipeline.`);
    }

    emit("pipeline:message", message, {
        pipeline: globalThis.pipeline
    });
}

/**
 * Emit progress event for a step.
 * Note: Can only be used inside a step context
 * @param progress Progress value to emit
 */
export function progress(progress: number) {
    if(!globalThis.pipeline || !globalThis.stage || !globalThis.step) {
        throw new Error(`Progress was emitted outside the scope of step in a pipeline.`);
    }

    emit("step:progress", progress, {
        pipeline: globalThis.pipeline as PipelineRun,
        stage: globalThis.stage,
        step: globalThis.step
    });
}

/**
 * Emit an event
 * @param eventName Name of the event to emit
 * @param args Parameters to pass to handler
 */
export function emit<T extends EventName>(eventName: T, ...args: EventHandlerParams<T>) {
    workerEmit({ name: eventName, args } as WorkerEmitEvent<T>);
}

/**
 * Write a value to the output of the current pipeline step.
 * @param key Key to write to
 * @param value Value to write
 * @returns Written value
 */
export function set<T = any>(key: string, value: T) {
    const step: IStep = globalThis.step;
    const stage: IStage = globalThis.stage;
    const pipeline: PipelineRun = globalThis.pipeline;

    return writeOutput<T>(pipeline, `${stage.id}.${step.id}.${key}`, value);
}

/**
 * Get a value by the path in the pipelines-outputs object
 * Usage: 
 *  <stage-id>.<step-id>.key - Reads a key-value pair from a step in a specific stage
 *  <step-id>.key - Reads a key-value pair from a step in the same stage
 *  key - Reads a key-value pair from the current step
 * @param path Path to the value
 */
export function get<T = any>(path: string) {
    return getOrDefault<T>(path, undefined);
}

/**
 * Get a value by the path in the pipelines-outputs object
 * Usage: 
 *  <stage-id>.<step-id>.key - Reads a key-value pair from a step in a specific stage
 *  <step-id>.key - Reads a key-value pair from a step in the same stage
 *  key - Reads a key-value pair from the current step
 * @param path Path to the value
 * @param defaultValue Default value to return
 */
export function getOrDefault<T = any>(path: string, defaultValue: T) {
    const step: IStep = globalThis.step;
    const stage: IStage = globalThis.stage;
    const pipeline: PipelineRun = globalThis.pipeline;

    return readOutput<T>(pipeline, path, defaultValue);
}


function writeOutput<T = any>(pipeline: PipelineRun, path: string, value: T) {
    const parts = path.split(".");

    let currentObj = pipeline.outputs;
    for(let index = 0; index < parts.length; index++) {
        const key = parts[index];

        // Check if last key has been reached
        if(index == parts.length - 1) {
            // If true, set value to object
            currentObj[key] = value;
            return value;
        }

        // Otherwise get nested object or create it
        if(typeof currentObj[key] === "undefined" || currentObj[key] == null) {
            // Instantiate new nested object if it is null
            currentObj[key] = {};
        }

        // If nested object now exists, continue into next nested object
        currentObj = currentObj[key];
    }
}

function readOutput<T = any>(pipeline: PipelineRun, path: string, defaultValue: T): T {
    const parts = path.split(".");

    let currentObj = pipeline.outputs;
    for(let index = 0; index < parts.length; index++) {
        const key = parts[index];

        // Check if last key has been reached
        if(index == parts.length - 1) {
            // If true, return value on the current object at that key
            return currentObj[key] ?? defaultValue ?? undefined;
        }

        // If there is no nested object, but the path requires one, return undefined or defaultValue
        if(typeof currentObj[key] === "undefined" || currentObj[key] == null) {
            return defaultValue ?? undefined
        }

        // If nested object exists, continue into next nested object
        currentObj = currentObj[key];
    }
}