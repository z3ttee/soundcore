import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AlbumModule } from "../album/album.module";
import { ArtistModule } from "../artist/artist.module";
import { DistributorModule } from "../distributor/distributor.module";
import { LabelModule } from "../label/label.module";
import { PublisherModule } from "../publisher/publisher.module";
import { SongModule } from "../song/song.module";
import { MeiliSyncer } from "./jobs/sync.job";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ArtistModule,
        AlbumModule,
        SongModule,
        PublisherModule,
        LabelModule,
        DistributorModule
    ],
    providers: [
        MeiliSyncer
    ]
})
export class CronModule {}