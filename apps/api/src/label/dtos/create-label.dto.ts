import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateLabelDTO {

    @IsNotEmpty()
    @Length(3, 254)
    public name: string;

    @IsOptional()
    public geniusId?: string;

    @IsOptional()
    public description?: string;

}