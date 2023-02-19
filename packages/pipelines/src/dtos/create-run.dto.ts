import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { Environment } from "../entities/common.entity";

export class CreatePipelineRunDTO {

    @IsString()
    @IsNotEmpty()
    public id: string;

    @IsObject()
    @IsOptional()
    public environment: Environment;

}