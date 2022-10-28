
export class OIDCUser {

    public sid: string;
    public preferred_username: string;
    public sub: string;

    public exp: number;
    public iat: number;
    public iss: string;
    public realm_access: { roles: string[] }[];
    public resource_access: { account: { roles: string[] }}
    public email_verified: boolean;
    public scope: string;
}