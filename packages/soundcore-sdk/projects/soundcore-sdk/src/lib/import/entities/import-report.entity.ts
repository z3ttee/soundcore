import { ImportTask } from "./import.entity";

export class ImportReport<D = any> {
    public readonly id: string;
    public createdAt: number;
    public task: ImportTask;
    public data: D;
}