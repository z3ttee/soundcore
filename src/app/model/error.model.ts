
export class AllianceError {
    public id: string;
    public message: string | Record<string, string[]>;
    public path?: string;
    public statusCode: number;
    public timestamp: Date;
}