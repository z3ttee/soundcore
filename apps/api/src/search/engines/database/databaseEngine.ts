import { Pageable, Page } from "@soundcore/common";
import { SearchEngine } from "../engine";

export class DatabaseSearchEngine extends SearchEngine {


    searchAllUsers<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllPlaylists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllSongs<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllAlbums<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }
    searchAllArtists<T = unknown>(query: string, pagination: Pageable): Promise<Page<T>> {
        throw new Error("Method not implemented.");
    }

    public async synchronize(): Promise<any> {
        this.logger.log(`Skipping search engine synchronization because the database is configured to be used as engine.`);
    }

}