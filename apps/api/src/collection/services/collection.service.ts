import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Collection } from "../entities/collection.entity";
import { Like } from "../entities/like.entity";

@Injectable()
export class CollectionService {

    constructor(
        @InjectRepository(Like) private readonly likeRepository: Repository<Like>
    ) {}

    public async findByUserId(userId: string): Promise<Collection> {
        const result = await this.likeRepository.createQueryBuilder("like")
            .leftJoin("like.song", "song")
            .select(["SUM(song.duration) AS totalDuration", "COUNT(song.id) AS songsCount"])
            .where("like.userId = :userId", { userId })
            .getRawOne()

        const collection = new Collection()
        collection.songsCount = parseInt(result["songsCount"]) || 0;
        collection.totalDuration = parseInt(result["totalDuration"]) || 0;

        return collection;
    }

}