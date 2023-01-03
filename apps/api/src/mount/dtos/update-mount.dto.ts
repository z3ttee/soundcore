import { IsBoolean, IsNotEmpty, IsOptional, Length } from "class-validator";

export class UpdateMountDTO {

    @IsNotEmpty()
    @Length(3, 32)
    public name: string;

    @IsOptional()
    @IsBoolean()
    public setAsDefault?: boolean;

    @IsOptional()
    @IsBoolean()
    public doScan?: boolean;

}