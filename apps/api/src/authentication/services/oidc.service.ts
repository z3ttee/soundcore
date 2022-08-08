import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { Client, Issuer } from "openid-client";
import { OIDCConfig } from "../config/oidc.config";
import { OIDC_OPTIONS } from "../oidc.constants";
import crypto from "node:crypto";

@Injectable()
export class OIDCService {
    private readonly logger: Logger = new Logger(OIDCService.name);

    private _issuer: Issuer;
    private _client: Client;
    private _jwks: any;
    private _keys: Map<string, any> = new Map();

    constructor(
        private readonly jwtService: JwtService,
        @Inject(OIDC_OPTIONS) private readonly options: OIDCConfig
    ) {}

    public async discoverIssuer() {
        return Issuer.discover(`${this.options.server_base_url}/realms/${this.options.realm}`).then((issuer) => {
            this._issuer = issuer 
            this._client = new this._issuer.Client({
                client_id: this.options.client_id,
                client_secret: this.options.client_secret,
                redirect_uris: [this.options.redirect_uri],
                response_types: ["code"]
            })

            return this.findJwks().catch((error) => {
                this.logger.warn(`Could not fetch jwks from remote issuer. Token validation may be unavailable: ${error.message}`);
                return null;
            }).then((result) => {
                this._jwks = result;
                return this._client.issuer.metadata;
            });
        });
    }

    public client(): Client {
        return this._client;
    }

    public issuer(): Issuer {
        return this._issuer;
    }

    public getJwksUri(): string {
        return this._client?.issuer?.metadata?.jwks_uri;
    }

    public async verifyAccessToken(tokenValue: string): Promise<void> {

        const token = this.jwtService.decode(tokenValue, { complete: true });
        const kid = token?.["header"]?.["kid"];
        const alg = token?.["header"]?.["alg"];

        if(!this._keys.has(kid)) {
            await this.findJwks();
            if(!this._keys.has(kid)) {
                throw new BadRequestException("Invalid access token.");
            }
        }

        const derEncodedCert = `${this._keys.get(kid)?.["x5c"]?.[0]}`;
        const pemEncodedcert = `-----BEGIN CERTIFICATE-----\n${derEncodedCert}\n-----END CERTIFICATE-----`;
        const publicKey = crypto.createPublicKey(pemEncodedcert).export({ type: "pkcs1", format: "pem" });

        const decoded = this.jwtService.verify(tokenValue, {
            secret: publicKey,
            algorithms: [alg]
        })

        return decoded;
    }

    private async findJwks() {
        const jwksUri = this.getJwksUri();
        return axios.get(`${jwksUri}`).then((response) => {
            const jwks = response.data;
            const keys: any[] = jwks?.["keys"] || [];
            
            for(const key of keys) {
                const kid = key?.["kid"];
                this._keys.set(kid, key);
            }

            this._jwks = jwks;
            return response.data;
        })
    }

}