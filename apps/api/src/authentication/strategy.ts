import { verifyToken } from "@clerk/backend";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { decode, Jwt, JwtPayload } from "jsonwebtoken";
import { Strategy } from "passport-custom";
import { ErrorCodes } from "../errorCodes";
import { Jwks } from "./entities/jwks";

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, "clerk") {
  @Inject()
  private readonly _jwks: Jwks;

  async validate(req: Request): Promise<JwtPayload> {
    const tokenValue = this._getTokenOrThrow(req);
    const token = decode(tokenValue, { complete: true });
    const key = this._getSigningKeyOrThrow(token);

    console.log("token:", tokenValue);

    return verifyToken(tokenValue, {
      jwtKey: key,
    }).catch((error: Error) => {
      console.error("Token verification failed:", error.message);
      throw new UnauthorizedException(ErrorCodes.TOKEN_INVALID);
    });
  }

  private _getTokenOrThrow(req: Request) {
    const token = req.headers.authorization?.split(" ").pop();
    if (!token) throw new UnauthorizedException(ErrorCodes.TOKEN_MISSING);
    return token;
  }

  private _getSigningKeyOrThrow(token: Jwt) {
    const kid = token.header.kid;
    const key = this._jwks.getSigningKeyById(kid);
    if (!key) throw new UnauthorizedException(ErrorCodes.TOKEN_INVALID);
    return key;
  }
}
