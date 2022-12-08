
export interface JWK {
    /**
     * The unique identifier for the key.
     */
    kid: string;
    /**
     * The family of cryptographic algorithms used with the key.
     */
    kty: string;
    /**
     * The specific cryptographic algorithm used with the key.
     */
    alg: string;
    /**
     * How the key was meant to be used; sig represents the signature.
     */
    use: string;
    /**
     * The modulus for the RSA public key.
     */
    n: string;
    /**
     * The exponent for the RSA public key.
     */
    e: string;
    /**
     * The x.509 certificate chain. The first entry in the array is the 
     * certificate to use for token verification; the other certificates 
     * can be used to verify this first certificate.
     */
    x5c: string[];
    /**
     * The thumbprint of the x.509 cert (SHA-1 thumbprint).
     */
    x5t: string;
}

export interface JWKSet {
    keys: JWK[];
}

export class JWKStore {
    /**
     * Set of keys
     */
    private readonly keystore: Map<string, JWK> = new Map();

    private readonly sigKeys: Map<string, JWK> = new Map();

    public get keys(): JWK[] {
        return Array.from(this.keystore.values());
    }

    constructor(keyset?: JWKSet) {
        this.setAll(keyset);
    }

    public has(kid: string) {
        return this.keystore.has(kid);
    }

    public hasSigKey(kid: string) {
        return this.sigKeys.has(kid);
    }

    public set(kid: string, value: JWK) {
        this.keystore.set(kid, value);
    }

    public remove(kid: string) {
        this.keystore.delete(kid);
    }

    public getSigKey(kid: string) {
        return this.sigKeys.get(kid);
    }

    public setAll(keyset?: JWKSet) {
        for(const key of keyset?.keys ?? []) {
            if(typeof key === "undefined" || key == null) continue;
            
            // Check if its signing key, has a kid and has useful public keys
            if(key.use === "sig" && key.kid && ((key.x5c && key.x5c.length) || key.n && key.e)) {
                this.sigKeys.set(key.kid, key);
            } else {
                // Otherwise just add it to keystore
                this.set(key.kid, key);
            }
        }
    }

    
}