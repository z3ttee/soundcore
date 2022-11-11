import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../user/entities/user.entity";
import { Token, TokenDTO } from "../entities/token.entity";
import { v4 as uuidv4 } from "uuid";

// Expires in (seconds)
const TOKEN_EXPIRES_IN = 30

@Injectable()
export class StreamTokenService {

    constructor(
        private jwtService: JwtService
    ) {}

    public async createForSong(authentication: User, songId: string): Promise<TokenDTO> {
        const tokenData: Token = {
            songId,
            userId: authentication.id,
            expiresAt: await this.generateExpiry(),
            shortToken: uuidv4()
        }

        return this.jwtService.signAsync(tokenData, { expiresIn: TOKEN_EXPIRES_IN }).then((token) => {
            return { token }
        })
    }

    public async decodeToken(value: string): Promise<Token> {
        return this.jwtService.verifyAsync(value).then((decoded: Token) => {
            return decoded;
        })
    }

    public isExpired(token: Token) {
        return token.expiresAt <= Date.now();
    }

    private async generateExpiry(): Promise<number> {
        return new Date(Date.now() + 1000*TOKEN_EXPIRES_IN).getTime();
    }

}