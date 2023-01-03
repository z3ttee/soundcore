import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddSongDTO {

    @IsNotEmpty()
    @IsString()
    public targetSongId: string;

    @IsOptional()
    @IsBoolean()
    public force?: boolean;

}