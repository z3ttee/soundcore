import { PlaylistPrivacy } from "../../playlist/enums/playlist-privacy.enum";
import { SCDKResourceFlag, SCDKResourceType } from "../../utils/entities/resource";
import { MeiliArtwork } from "./meili-artwork.entity";
import { MeiliUser } from "./meili-user.entity";

export class MeiliPlaylist {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description: string,
        public readonly resourceType: SCDKResourceType,
        public readonly privacy: PlaylistPrivacy,
        public readonly createdAt: Date,
        public readonly flag: SCDKResourceFlag,
        public readonly author: MeiliUser,
        public readonly artwork: MeiliArtwork
    ) {}

}