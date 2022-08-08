import { DynamicModule, Module } from '@nestjs/common';
import { FileSystemService } from './services/filesystem.service';

export const SC_ARTWORKDIR_NAME = "artworks";
export const SC_IDFILE_NAME = ".instanceId";

@Module({
  
})
export class FileSystemModule {

  public static forRoot(): DynamicModule {
    return {
      module: FileSystemModule,
      global: true,
      providers: [
        FileSystemService
      ],
      exports: [
        FileSystemService
      ]
    }
  }

}
