
export class TokenDTO {
    public token: string;
}

export class Token {
    public userId: string;
    public songId: string;
    public expiresAt: Date;
}