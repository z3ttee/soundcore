import { GATEWAY_EVENT_IMPORTTASK_UPDATE } from "../../constants";
import { ImportTask } from "../../import/entities/import.entity";
import { GatewayEvent } from "./gateway-event";

export class ImportTaskUpdateEvent implements GatewayEvent<ImportTask> {

    public readonly name: string = GATEWAY_EVENT_IMPORTTASK_UPDATE;

    constructor(
        public readonly payload: ImportTask
    ) {}

}