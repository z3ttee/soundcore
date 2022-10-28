
export interface OIDCConfig {

    server_base_url: string;
    realm: string;
    client_id: string;
    client_secret?: string;
    redirect_uri?: string;

}