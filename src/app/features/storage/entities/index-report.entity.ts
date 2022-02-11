import { Index } from "../../upload/entities/index.entity";

export class IndexReport {
    public id: string;
    public index: Index;
    public jsonContents: IndexReportElement[];
    public createdAt: Date;
    public updatedAt: Date;
}

export class IndexReportElement {
    public timestamp: number = Date.now();
    public status: "info" | "warn" | "error" = "info";
    public message: string;
    public stack?: string;
    public context?: Record<string, any>;
}