import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../user/entities/user.entity";
import { Token, TokenDTO } from "../entities/token.entity";

const TOKEN_EXPIRES_IN = 60*30

@Injectable()
export class StreamTokenService {

    constructor(
        private jwtService: JwtService
    ) {}

    public async createForSong(authentication: User, songId: string): Promise<TokenDTO> {
        return this.jwtService.signAsync({
            songId,
            userId: authentication.id,
            expiresAt: await this.generateExpiry()
        } as Token, {
            expiresIn: TOKEN_EXPIRES_IN
        }).then((token) => {
            return {
                token
            }
        })
    }

    public async decodeToken(value: string): Promise<Token> {
        return this.jwtService.verifyAsync(value).then((decoded: Token) => {
            return decoded;
        })
    }

    private async generateExpiry(): Promise<Date> {
        return new Date(Date.now() + 1000*TOKEN_EXPIRES_IN);
    }

}