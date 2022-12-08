import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LikedResource } from "../entities/like.entity";

@Injectable()
export class CollectionService {

    constructor(
        @InjectRepository(LikedResource) private readonly likeRepository: Repository<LikedResource>
    ) {}

}