import { SSOUser } from "src/app/sso/entities/sso-user.entity";

export class User extends SSOUser {
    public override id: string;
    public override username: string;
    public override avatarResourceId?: string;
    public accentColor?: string;
}