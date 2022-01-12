import { SSORole } from "./sso-role.model";

export class SSOUser {
    public id: string;
    public username: string;
    public email: string;
    public role: SSORole;
    public createdAt: Date;
    public avatarResourceId?: string;
    public avatarUrl?: string;
    public isAnonymous: boolean = false;

    public static anonymous(): SSOUser {
        return {
            id: "123",
            username: "Unknown user",
            email: "unknown@email.xyz",
            role: null,
            createdAt: new Date(),
            isAnonymous: true
        }
    }

}