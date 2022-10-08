# NestJS Queue Module
This package contains a basic queue implementation to inject in NestJS projects

## Usage
This package is designed to register a new queue for every module the `QueueModule`
is imported. So to use a queue in one of your modules, import like it is done
in the following example:

```javascript

```

## Worker Queue Events
started: (job: WorkerJob<T>) => Promise<void> | void
completed: (job: WorkerJob<T>, result: R) => Promise<void> | void;
failed: (job: WorkerJob<T>, error: E) => Promise<void> | void;
progress: (job: WorkerJob<T>, progress: number) => Promise<void> | void;

## Creating a worker and emit progress
```javascript
export default function (job: WorkerJob<any>) {
    workerpool.workerEmit(new WorkerProgressEvent(job, 0.3));
}
```

