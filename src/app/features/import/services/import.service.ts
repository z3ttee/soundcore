import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CreateImportDTO } from "../dtos/create-import.dto";
import { ImportEntity } from "../entities/import.entity";

@Injectable()
export class ImportService {

    private _importsSubject: BehaviorSubject<ImportEntity[]> = new BehaviorSubject([])

    // TODO: Update imports via socket

    public $imports: Observable<ImportEntity[]> = this._importsSubject.asObservable();

    constructor(
        private httpClient: HttpClient
    ){}

    public async createImport(createImportDto: CreateImportDTO): Promise<ImportEntity> {
        return firstValueFrom(this.httpClient.post(`${environment.api_base_uri}/v1/imports`, createImportDto)).then((result: ImportEntity) => {
            this.updateLocalImports(result);
            return result;
        })
    }

    private updateLocalImports(entity: ImportEntity) {
        const imports = this._importsSubject.getValue();
        const index = imports.findIndex((e) => e.id == entity.id);
        
        if(index == -1) {
            imports.push(entity);
        } else {
            imports[index] = entity;
        }

        this._importsSubject.next(imports);
    }

}