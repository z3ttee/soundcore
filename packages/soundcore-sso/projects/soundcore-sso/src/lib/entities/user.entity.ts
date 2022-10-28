
export class SSOUser {

    public readonly id!: string;
    public readonly name!: string;
    public readonly roles!: string[];
    public readonly type: "anonymous" | "authenticated" = "anonymous";

    constructor(id?: string, name?: string, roles?: string[]) {
        this.type = !id ? "anonymous" : "authenticated";
        this.id = id || "unknown-user";
        this.name = name || "Anonymous";
        this.roles = roles || [];
    }

}