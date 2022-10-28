# NestJS Queue Module
This package contains a basic queue implementation to inject in NestJS projects

## Usage
This package is designed to register a new queue for every module the `QueueModule`
is imported. So to use a queue in one of your modules, import like it is done
in the following example:

```javascript

```

## Worker Queue Events
started: (job: WorkerJob<T, R>) => Promise<void> | void
completed: (job: WorkerJob<T, R>, result: R) => Promise<void> | void;
failed: (job: WorkerJobRef<T>, error: E) => Promise<void> | void;
progress: (job: WorkerJobRef<T>, progress: number) => Promise<void> | void;

## Creating a worker and emit progress
```javascript
export default function (job: WorkerJobRef<any>) {
    workerpool.workerEmit(new WorkerProgressEvent(job, 0.3));
}
```

