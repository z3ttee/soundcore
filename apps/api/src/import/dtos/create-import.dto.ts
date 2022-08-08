import { IsNotEmpty, IsOptional, IsUrl, Length } from "class-validator";

export class CreateImportDTO {

    @IsNotEmpty()
    @IsUrl()
    public url: string;

    @IsOptional()
    public mountId?: string;

    @IsOptional()
    @Length(3, 254)
    public title?: string;

    @IsOptional()
    public artists?: string[];

    @IsOptional()
    public albums?: string[];

}