export type JwksKey = {
  kty: string;
  use: string;
  kid: string;
  n: string;
  e: string;
};

export class Jwks {
  private readonly _keysMap: Map<string, JwksKey>;

  constructor(keys: JwksKey[]) {
    this._keysMap = new Map<string, JwksKey>(keys.map((key) => [key.kid, key]));
  }

  public static fromJson(json: any): Jwks {
    if (!json || !Array.isArray(json.keys)) {
      throw new Error("Invalid JWKS JSON format");
    }
    return new Jwks(json.keys);
  }

  public get keys(): JwksKey[] {
    return Array.from(this._keysMap.values());
  }

  public getKeyById(kid: string) {
    if (!kid) return null;
    return this._keysMap.get(kid) || null;
  }

  public getSigningKeyById(kid: string) {
    if (!kid) return null;
    const key = this.getKeyById(kid);
    if (!key || key.use !== "sig") {
      return null;
    }
  }
}
