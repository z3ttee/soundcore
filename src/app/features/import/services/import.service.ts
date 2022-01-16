import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { CreateImportDTO } from "../dtos/create-import.dto";

@Injectable()
export class ImportService {

    constructor(private httpClient: HttpClient){}

    public async createImport(createImportDto: CreateImportDTO): Promise<any> {
        return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/imports`, createImportDto))
    }

}