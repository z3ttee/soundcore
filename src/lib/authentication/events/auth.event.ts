
export type AllianceAuthEventType = "success" | "error" | "ready" | "refreshSuccess" | "refreshSuccess" | "refreshError" | "logout" | "expired" 
export class AllianceAuthEvent {

    public readonly type: AllianceAuthEventType;
    public readonly data?: any;

    constructor(type: AllianceAuthEventType, data?: any) {
        this.type = type;
        this.data = data;
    }

}