import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient){}

    public async findProfileById(userId: string): Promise<User> {
        return firstValueFrom(this.httpClient.get(`${environment.sso_base_uri}/v1/users/${userId}`)) as Promise<User>
    }

}