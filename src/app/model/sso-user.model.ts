import { SSORole } from "./sso-role.model";

export class SSOUser {
    public id: string;
    public username: string;
    public email: string;
    public role: SSORole;
    public createdAt: Date;
    public avatarResourceId?: string;

}