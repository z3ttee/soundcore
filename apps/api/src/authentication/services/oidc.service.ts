import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { BaseClient, Client, Issuer } from "openid-client";
import { OIDCConfig } from "../config/oidc.config";
import { OIDC_OPTIONS } from "../oidc.constants";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";
import { JWTDecodedToken, JWTTokenPayload, KeycloakDecodedToken } from "../entities/oidc-token.entity";
import { JWKSet, JWKStore } from "../entities/jwks.entity";
import { Bootstrapper } from "@soundcore/bootstrap";

@Injectable()
export class OIDCService {
    private readonly logger: Logger = new Logger(OIDCService.name);

    private _issuer: Issuer;
    private _client: Client;

    // Updated by findRemoteJwks()
    private _keystore: JWKStore;

    constructor(
        private readonly jwtService: JwtService,
        @Inject(OIDC_OPTIONS) private readonly options: OIDCConfig
    ) {
        if(!this.options.issuer) {
            this.logger.error(`Found invalid issuer url. A valid value is needed for proper authentication.`);
            Bootstrapper.shutdown();
        }
    }

    public client(): Observable<Client> {
        return new Observable((subscriber) => {
            subscriber.add(this.issuer().subscribe(() => {
                subscriber.next(this._client);
                subscriber.complete();
            }));
        })
    }

    public jwksUri(): Observable<string> {
        return this.client().pipe(map((client) => client?.issuer?.metadata?.jwks_uri));
    }

    public verifyAccessToken(tokenValue: string): Observable<JWTTokenPayload> {
        return this.issuer().pipe(
            switchMap(() => {
                const token = this.jwtService.decode(tokenValue, { complete: true }) as KeycloakDecodedToken;
                const kid = token?.header?.kid;

                // Get jwks
                return this.jwks().pipe(tap(() => {
                    // Check if the kid on the jwt exists
                    // as signing key in the keystore
                    if(!this._keystore.hasSigKey(kid)) {
                        throw new BadRequestException("Invalid access token. Did you configure the oidc issuer correctly? If not, a malicious jwt was successfully blocked.");
                    }
                }), map(() => token));
            }),
            map((token: JWTDecodedToken) => {
                // Check if jwt has header with key id
                if(!token.header || !this._keystore.hasSigKey(token.header.kid)) {
                    throw new UnauthorizedException("Invalid access token");
                }

                const kid = token.header.kid;
                const signingKey = this._keystore.getSigKey(kid);
                const publicKey = this.convertCertToPEM(signingKey.x5c[0]);

                try {
                    const decodedTokenPayload = this.jwtService.verify<JWTTokenPayload>(tokenValue, { publicKey });
                    return decodedTokenPayload;
                } catch (error) {
                    throw error;
                }
            })
        );
    }

    public convertCertToPEM(cert: string): string {
        return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
    }

    public issuer(): Observable<Issuer> {
        return new Observable((subscriber) => {
            if(typeof this._issuer !== "undefined" && this._issuer != null) {
                subscriber.next(this._issuer);
                subscriber.complete();
                return;
            }

            const discoverObservable: Observable<Issuer<BaseClient>> = new Observable((sub) => {
                Issuer.discover(`${this.options.issuer}`).then((issuer) => {
                    this._issuer = issuer 
                    this._client = new this._issuer.Client({
                        client_id: this.options.client_id,
                        client_secret: this.options.client_secret,
                        redirect_uris: [this.options.redirect_uri],
                        response_types: ["code"]
                    })
    
                    this._issuer = issuer;
                    sub.next(issuer);
                }).catch((error: Error) => {
                    sub.error(error);
                }).finally(() => {
                    sub.complete();
                });
            })

            subscriber.add(discoverObservable.pipe(catchError((err, caught) => {
                subscriber.error(err);
                return caught;
            })).subscribe((issuer) => {
                console.log(issuer);
                subscriber.next(issuer);
                subscriber.complete();
            }));
        });
        
    }

    public jwks(): Observable<JWKStore> {
        return new Observable((subscriber) => {
            // Return existing jwks if exists
            if(typeof this._keystore !== "undefined" && this._keystore != null) {
                subscriber.next(this._keystore);
                subscriber.complete();
                return;
            }

            subscriber.add(this.fetchAndCacheJwks().pipe(catchError((error: Error, caught) => {
                this.logger.warn(`Could not fetch jwks from remote issuer. Token validation may be unavailable: ${error.message}`);

                subscriber.error(error);
                subscriber.complete();
                return of(null);
            })).subscribe((jwks) => {
                subscriber.next(jwks);
                subscriber.complete();
            }));
        });
    }

    private fetchAndCacheJwks(): Observable<JWKStore> {
        return new Observable((subscriber) => {
            subscriber.add(this.jwksUri().subscribe((jwksUri) => {
                fetch(jwksUri).then((response) => {
                    return response.json();
                }).catch(() => {
                    return null;
                }).then((jwks: JWKSet) => {
                    // Throw error if no jwks fetched
                    if(typeof jwks === "undefined" || jwks == null) subscriber.error(new InternalServerErrorException("Failed fetching jwks"));
        
                    this._keystore = new JWKStore(jwks);
                    subscriber.next(this._keystore);
                }).catch((error: Error) => {
                    subscriber.error(error);
                }).finally(() => {
                    subscriber.complete();
                })
            }));
        });
    }

}