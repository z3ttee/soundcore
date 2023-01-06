import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, Length, Max, Min } from "class-validator";
import { Mount } from "../entities/mount.entity";

export class CreateMountDTO implements 
    Pick<Mount, "name">, 
    Partial<Pick<Mount, "isDefault">> 
{

    @IsNotEmpty()
    @Length(3, 32)
    public name: string;

    @IsOptional()
    @Length(3, 4095)
    public directory?: string;

    @IsNotEmpty()
    @IsObject()
    public bucket: { id: string };

    @IsOptional()
    @IsBoolean()
    public doScan?: boolean = true;

    @IsOptional()
    @IsNumber()
    @Max(1)
    @Min(0)
    public isDefault: boolean = false;

}