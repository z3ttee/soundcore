import { SSOUser } from "src/app/model/sso-user.model";

export class User extends SSOUser {
    public override id: string;
    public override username: string;
    public override avatarResourceId?: string;
}