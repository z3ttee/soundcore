import { IsArray, IsBoolean, IsNotEmpty, IsOptional, Length } from "class-validator";
import { User } from "../../user/entities/user.entity";

export class CreateNotificationDTO {

    @IsNotEmpty()
    @Length(3, 120)
    public title: string;

    @IsNotEmpty()
    @Length(3, 254)
    public message: string;

    @IsArray()
    @IsOptional()
    public targets?: User[];

    @IsBoolean()
    @IsOptional()
    public isBroadcast?: boolean;

}