
export class RedlockError extends Error {

    constructor(message = "Process has no guranteed exclusivity on resource. Writing to the resource is therefor denied.") {
        super(message);
    }

}