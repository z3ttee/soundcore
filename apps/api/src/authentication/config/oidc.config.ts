
export interface OIDCConfig {
    issuer: string;
    client_id: string;
    client_secret?: string;
    redirect_uri?: string;
}