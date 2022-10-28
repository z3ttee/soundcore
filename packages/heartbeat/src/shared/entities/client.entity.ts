
export enum ClientProtocol {

    /**
     * Client supports REST
     * communication via http
     */
    HTTP = "http",

    /**
     * Client supports REST
     * communication via https
     */
    HTTPS = "https",

    /**
     * Client supports microservice
     * communication via redis
     */
    REDIS = "redis"
}

export class ClientInfo {

    constructor(
        public readonly host: string,
        public readonly port: number,
        public readonly url: string,
        public readonly protocols: ClientProtocol[] = []
    ) {}

}