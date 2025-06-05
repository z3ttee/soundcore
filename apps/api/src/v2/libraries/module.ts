import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LibrariesController } from "./controllers/libraries.controller";
import { Library } from "./entities/library.entity";

@Module({
  controllers: [LibrariesController],
  providers: [],
  imports: [TypeOrmModule.forFeature([Library])],
})
export class LibrariesModule {}
