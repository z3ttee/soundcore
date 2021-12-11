import { SSOPermission } from "./sso-permission.model";

export class SSORole {
    public id: string;
    public title: string;
    public description?: string;
    public hierarchy: number;

    public permissions: SSOPermission[]
}