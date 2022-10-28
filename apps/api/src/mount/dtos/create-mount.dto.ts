import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateMountDTO {

    @IsNotEmpty()
    @Length(3, 32)
    public name: string;

    @IsNotEmpty()
    @Length(3, 4095)
    public directory?: string;

    @IsNotEmpty()
    @Length(36)
    public bucketId: string;

    @IsOptional()
    public doScan?: boolean = true;

    @IsOptional()
    public setAsDefault?: boolean = false;

}