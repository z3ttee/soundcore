import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { Album } from "../../album/entities/album.entity";
import { Artist } from "../../artist/entities/artist.entity";
import { ArtworkService } from "../../artwork/services/artwork.service";
import { GENIUS_API_BASE_URL } from "../../constants";
import { Distributor } from "../../distributor/entities/distributor.entity";
import { DistributorService } from "../../distributor/services/distributor.service";
import { Genre } from "../../genre/entities/genre.entity";
import { GenreService } from "../../genre/services/genre.service";
import { Label } from "../../label/entities/label.entity";
import { LabelService } from "../../label/services/label.service";
import { Publisher } from "../../publisher/entities/publisher.entity";
import { PublisherService } from "../../publisher/services/publisher.service";
import { Song } from "../../song/entities/song.entity";
import { Levenshtein } from "../../utils/levenshtein";
import { GeniusAlbumDTO } from "../lib/genius-album.dto";
import { GeniusArtistDTO } from "../lib/genius-artist.dto";
import { GeniusReponseDTO, GeniusSearchResponse } from "../lib/genius-response.dto";
import { GeniusSearchPageResultDTO } from "../lib/genius-search-page.dto";
import { GeniusCustomPerformance, GeniusSongDTO } from "../lib/genius-song.dto";
import { GeniusTagDTO } from "../lib/genius-tag.dto";

@Injectable()
export class GeniusClientService {
    private readonly logger: Logger = new Logger(GeniusClientService.name);

    constructor(
        private readonly artworkService: ArtworkService,
        private readonly labelService: LabelService,
        private readonly distributorService: DistributorService,
        private readonly publisherService: PublisherService,
        private readonly genreService: GenreService
    ) {}

    /**
     * Find artist information on genius.com. If found, all information are applied and returned as new artist object.
     * @param artist Artist to lookup
     * @returns Artist
     */
    public async lookupArtist(artist: Artist): Promise<Artist> {
        const result: Artist = Object.assign(new Artist(), artist);

        // Get the resource id from given artist object.
        // If the object has no geniusId, try and search a matching id
        // on genius.com. Fail, if this was not possible
        const resourceId = artist.geniusId ? artist.geniusId : await this.searchResourceIdOfType("artist", artist.name);
        if(!resourceId) return artist;

        // Request more detailed song data
        return this.fetchResourceByIdAndType<GeniusArtistDTO>("artist", resourceId).then(async (resource) => {
            // If there is an invalid response (e.g. errors)
            // then return unmodified artist object.
            if(!resource) return artist;

            result.geniusId = resource.id;
            result.description = resource.description_preview;

            // If there is an image url present on the resource.
            // Download it and create an artwork for the artist
            if(resource.image_url) {
                // Download url to buffer
                return this.artworkService.downloadToBuffer(resource.image_url).then((buffer) => {
                    // Create artwork and write buffer to file
                    return this.artworkService.createForArtistIfNotExists(artist, true, buffer).then((artwork) => {
                        // Update relation
                        result.artwork = artwork;
                        return result;
                    })
                })
            }

            return result;
        });
    }

    /**
     * Find album information on genius.com. If found, all information are applied and returned as new artist object.
     * @param album Album to lookup
     * @returns Album
     */
     public async lookupAlbum(album: Album): Promise<Album> {
        const result: Album = Object.assign(new Album(), album);
        const title = album?.name?.replace(/^(?:\[[^\]]*\]|\([^()]*\))\s*|\s*(?:\[[^\]]*\]|\([^()]*\))/gm, "").split("-")[0].trim();
        const artist = album.primaryArtist.name;
        const searchQuery = `${title} ${artist}`

        // Get the resource id from given album object.
        // If the object has no geniusId, try and search a matching id
        // on genius.com. Fail, if this was not possible
        const resourceId = album.geniusId ? album.geniusId : await this.searchResourceIdOfType("album", searchQuery);
        if(!resourceId) return album;

        // Request more detailed song data
        return this.fetchResourceByIdAndType<GeniusAlbumDTO>("album", resourceId).then(async (resource) => {
            // If there is an invalid response (e.g. errors)
            // then return unmodified album object.
            if(!resource) return album;

            // Update metadata
            result.geniusId = resource.id;
            result.description = resource.description_preview;
            result.releasedAt = resource.release_date;
            
            // Create labels if not exists
            const labels = await this.parseAndCreateLabels(resource.performance_groups).catch(() => []);
            // Create distributors if not exists
            const distributors = await this.parseAndCreateDistributors(resource.performance_groups).catch(() => []);
            // Create publishers if not exists
            const publishers = await this.parseAndCreatePublishers(resource.performance_groups).catch(() => []);

            // Update relations
            result.labels = labels;
            result.distributors = distributors;
            result.publishers = publishers;

            // If there is an image url present on the resource.
            // Download it and create an artwork for the album
            if(resource.cover_art_thumbnail_url) {
                // Download url to buffer
                return this.artworkService.downloadToBuffer(resource.cover_art_thumbnail_url).then((buffer) => {
                    // Create artwork and write buffer to file
                    return this.artworkService.createForAlbumIfNotExists(album, true, buffer).then((artwork) => {
                        // Update relation
                        result.artwork = artwork;
                        return result;
                    })
                })
            }

            // If no artwork to download, just return
            return result;
        });
    }

    /**
     * Find song information on genius.com. If found, all information are applied and returned as new artist object.
     * @param song Song to lookup
     * @returns Song
     */
     public async lookupSong(song: Song): Promise<Song> {
        const result: Song = Object.assign(new Song(), song);
        const title = song?.name?.replace(/^(?:\[[^\]]*\]|\([^()]*\))\s*|\s*(?:\[[^\]]*\]|\([^()]*\))/gm, "")?.split("-")?.[0]?.trim();
        const artist = song.primaryArtist?.name;
        const searchQuery = `${title} ${artist}`

        if(typeof title === "undefined" || title == null) return song;
        if(typeof artist === "undefined" || artist == null) return song;

        // Get the resource id from given artist object.
        // If the object has no geniusId, try and search a matching id
        // on genius.com. Fail, if this was not possible
        const resourceId = song.geniusId ? song.geniusId : await this.searchResourceIdOfType("song", searchQuery);
        if(!resourceId) return song;

        // Request more detailed song data
        return this.fetchResourceByIdAndType<GeniusSongDTO>("song", resourceId).then(async (resource) => {
            // If there is an invalid response (e.g. errors)
            // then return unmodified artist object.
            if(!resource) return song;

            // Update metadata
            result.geniusId = resource.id;
            result.description = resource.description_preview;
            result.releasedAt = resource.release_date;
            result.explicit = resource.explicit;
            result.location = resource.recording_location;
            result.youtubeUrl = resource.youtube_url;
            result.youtubeUrlStart = resource.youtube_start;

            // Create labels if not exists
            const labels = await this.parseAndCreateLabels(resource.custom_performances).catch(() => []);
            // Create distributors if not exists
            const distributors = await this.parseAndCreateDistributors(resource.custom_performances).catch(() => []);
            // Create publishers if not exists
            const publishers = await this.parseAndCreatePublishers(resource.custom_performances).catch(() => []);
            // Create genres if not exist
            const genres = await this.parseAndCreateGenres(resource.tags).catch(() => []);

            // Update relations
            result.labels = labels;
            result.distributors = distributors;
            result.publishers = publishers;
            result.genres = genres;

            // If there is an image url present on the resource.
            // Download it and create an artwork for the artist
            if(resource.song_art_image_thumbnail_url) {
                // Download url to buffer
                return this.artworkService.downloadToBuffer(resource.song_art_image_thumbnail_url).then((buffer) => {
                    // Create artwork and write buffer to file
                    return this.artworkService.createForSongIfNotExists(song, true, buffer).then((artwork) => {
                        // Update relation
                        result.artwork = artwork;
                        return result;
                    })
                })
            }

            // If no artwork to download, just return
            return result;
        });
    }

    /**
     * Parses the custom_performances or performance_groups array of a genius album or song resource.
     * This function then searches for the section labeled "Label" and create a label resource from
     * the given data inside.
     * @param custom_performances Genius custom_performances or performance_groups array that may contain a label section
     * @returns Label[]
     */
    protected async parseAndCreateLabels(custom_performances: GeniusCustomPerformance[]): Promise<Label[]> {
        const resources = custom_performances.find((value) => value.label == "Label");
        if(typeof resources == "undefined" || resources == null || resources.artists?.length <= 0) return [];
        const labels: Label[] = [];

        for(const resource of resources.artists) {   
            // Create label if not exists.       
            const labelResult: Label = await this.labelService.createIfNotExists({
                name: resource.name,
                description: resource.description_preview,
                geniusId: resource.id
            }).then((result) => {
                const label = result.data;

                // Download image url to buffer
                return this.artworkService.downloadToBuffer(resource.image_url).then((buffer) => {
                    // Write artwork
                    return this.artworkService.createForLabelIfNotExists(label, true, buffer).then((artwork) => {
                        // Set artwork to label
                        return this.labelService.setArtwork(label, artwork);
                    });
                }).catch((error) => {
                    // In case of error during artwork creation,
                    // just return the label without an artwork.
                    this.logger.warn(`Failed creating artwork for label '${resource.name}': ${error.message}`);
                    return label;
                })        

            }).catch((error) => {
                // In case of error just skip this label
                // by returning null and printing a short
                // warning to the console.
                this.logger.warn(`Failed creating label '${resource.name}' whilst looking up a resource on genius. Worst result of this error can just be a song or album not being put in relation with the label. Error: ${error.message}`);
                return null;
            });

            if(!labelResult) continue;
            labels.push(labelResult);
        }

        return labels;
    }

    /**
     * Parses the custom_performances or performance_groups array of a genius album or song resource.
     * This function then searches for the section labeled "Distributor" and create a distributor resource from
     * the given data inside.
     * @param custom_performances Genius custom_performances or performance_groups array that may contain a distributor section
     * @returns Distributor[]
     */
     protected async parseAndCreateDistributors(custom_performances: GeniusCustomPerformance[]): Promise<Distributor[]> {
        const resources = custom_performances.find((value) => value.label == "Distributor");
        if(typeof resources == "undefined" || resources == null || resources.artists?.length <= 0) return [];
        const distributors: Distributor[] = [];

        for(const resource of resources.artists) {   
            // Create distributor if not exists.       
            const distributorResult: Distributor = await this.distributorService.createIfNotExists({
                name: resource.name,
                description: resource.description_preview,
                geniusId: resource.id
            }).then((result) => {
                const distributor = result.data;

                // Download image url to buffer
                return this.artworkService.downloadToBuffer(resource.image_url).then((buffer) => {
                    // Write artwork
                    return this.artworkService.createForDistributorIfNotExists(distributor, true, buffer).then((artwork) => {
                        // Set artwork to distributor
                        return this.distributorService.setArtwork(distributor, artwork);
                    });
                }).catch((error) => {
                    // In case of error during artwork creation,
                    // just return the distributor without an artwork.
                    this.logger.warn(`Failed creating artwork for distributor '${resource.name}': ${error.message}`);
                    return distributor;
                })        

            }).catch((error) => {
                // In case of error just skip this distributor
                // by returning null and printing a short
                // warning to the console.
                this.logger.warn(`Failed creating distributor '${resource.name}' whilst looking up a resource on genius. Worst result of this error can just be a song or album not being put in relation with the distributor. Error: ${error.message}`);
                return null;
            });

            if(!distributorResult) continue;
            distributors.push(distributorResult);
        }

        return distributors;
    }

    /**
     * Parses the custom_performances or performance_groups array of a genius album or song resource.
     * This function then searches for the section labeled "Publisher" and create a publisher resource from
     * the given data inside.
     * @param custom_performances Genius custom_performances or performance_groups array that may contain a publisher section
     * @returns Publisher[]
     */
    protected async parseAndCreatePublishers(custom_performances: GeniusCustomPerformance[]): Promise<Publisher[]> {
        const resources = custom_performances.find((value) => value.label == "Publisher");
        if(typeof resources == "undefined" || resources == null || resources.artists?.length <= 0) return [];
        const publishers: Publisher[] = [];

        for(const resource of resources.artists) {   
            // Create publisher if not exists.       
            const publisherResult: Publisher = await this.publisherService.createIfNotExists({
                name: resource.name,
                description: resource.description_preview,
                geniusId: resource.id
            }).then((result) => {
                const publisher = result.data;

                // Download image url to buffer
                return this.artworkService.downloadToBuffer(resource.image_url).then((buffer) => {
                    // Write artwork
                    return this.artworkService.createForPublisherIfNotExists(publisher, true, buffer).then((artwork) => {
                        // Set artwork to publisher
                        return this.publisherService.setArtwork(publisher, artwork);
                    });
                }).catch((error) => {
                    // In case of error during artwork creation,
                    // just return the publisher without an artwork.
                    this.logger.warn(`Failed creating artwork for publisher '${resource.name}': ${error.message}`);
                    return publisher;
                })        

            }).catch((error) => {
                // In case of error just skip this publisher
                // by returning null and printing a short
                // warning to the console.
                this.logger.warn(`Failed creating publisher '${resource.name}' whilst looking up a resource on genius. Worst result of this error can just be a song or album not being put in relation with the publisher. Error: ${error.message}`);
                return null;
            });

            if(!publisherResult) continue;
            publishers.push(publisherResult);
        }

        return publishers;
    }

    /**
     * Parses the tags array of a genius album or song resource.
     * @param tags List of tags provided by genius. Those will be converted into Genres
     * @returns Genre[]
     */
     protected async parseAndCreateGenres(tags: GeniusTagDTO[]): Promise<Genre[]> {
        const genres: Genre[] = [];

        for(const resource of tags) {   
            // Create publisher if not exists.       
            const genreResult: Genre = await this.genreService.createIfNotExists({
                name: resource.name,
                description: null
            }).then((result) => {
                return result.data;
            }).catch((error) => {
                // In case of error just skip this publisher
                // by returning null and printing a short
                // warning to the console.
                this.logger.warn(`Failed creating genre '${resource.name}' whilst looking up a resource on genius. Worst result of this error can just be a song or album not being put in relation with the genre. Error: ${error.message}`);
                return null;
            });

            if(!genreResult) continue;
            genres.push(genreResult);
        }

        return genres;
    }

    /**
     * Fetch resource information from genius.com by its id and type of resource to fetch
     * @param type Type of resource
     * @param id Id of the resource
     * @returns <T = any>
     */
    protected async fetchResourceByIdAndType<T = any>(type: "song" | "album" | "artist", id: string): Promise<T> {
        const source = axios.CancelToken.source();

        // Timeout request after 10s
        const timeout = setTimeout(() => {
            source.cancel();
        }, 10000);

        // Request the resource by directly accessing the genius api.
        return axios.get<GeniusReponseDTO<T>>(`${GENIUS_API_BASE_URL}/${type}s/${id}`, { cancelToken: source.token }).then(async (response) => {
            // If there is an invalid response (e.g.: errors etc.) then returned unmodified song.
            if(!response || response.data.meta.status != 200 || !response.data.response[type]) return null;

            return response.data.response[type];
        }).finally(() => clearTimeout(timeout))
    }

    /**
     * Fetch a page from the genius search api using a query.
     * @param query Search query
     * @param page Page of search results to fetch
     * @param type Type of resource that is searched
     * @returns GeniusSearchPageResultDTO
     */
    protected searchPage(query: string, page: number, type: "song" | "album" | "artist"): Promise<GeniusSearchPageResultDTO> {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel();
        }, 30000)
        
        return axios.get<GeniusReponseDTO<GeniusSearchResponse>>(`${GENIUS_API_BASE_URL}/search/${type}?page=${page+1}&q=${encodeURIComponent(query)}`, { cancelToken: source.token }).then((response: AxiosResponse<GeniusReponseDTO<GeniusSearchResponse>>) => {
            if(!response || response.data.meta.status != 200 || !response.data.response.sections) return { result: [], hasNextPage: false };

            // Get matching section of response
            const matchingSection = response.data.response.sections.find((section) => section.type == type);
            if(!matchingSection) return { result: [], hasNextPage: false };

            return { result: matchingSection.hits.map((hit) => hit.result), hasNextPage: !!response.data.response.next_page }
        }).finally(() => clearTimeout(timeout))
    }

    /**
     * Get the geniusId of a resource on genius.com by searching for it.
     * @param type Type of resource
     * @param searchQuery Search query
     * @returns string
     */
    protected async searchResourceIdOfType(type: "song" | "album" | "artist", searchQuery: string): Promise<string> {
        const results: (GeniusArtistDTO | GeniusSongDTO | GeniusAlbumDTO)[] = [];

        for(let i = 0;; i++) {
            const res = await this.searchPage(searchQuery, i, type);
            results.push(...res.result)
            if(!res.hasNextPage) break;
        }

        // Step of optimization:
        // If the name / title of a result matches exactly, the element will be returned.
        const exactMatch = results.find((val) => {
            if(val._type != "song") {
                if(val["name"] == searchQuery) return val;
            } else {
                if(val["title"] == searchQuery) return val;
            }
        })

        if(exactMatch) {
            return exactMatch?.id;
        }

        let bestMatch: { score: number, hit: GeniusArtistDTO | GeniusSongDTO | GeniusAlbumDTO } = { score: 0, hit: null};

        for(const result of results) {
            const string = result._type != "song" ? result["name"] : result["title"]
            const score = Levenshtein.getEditDistance(string, searchQuery);

            if(score <= bestMatch.score || bestMatch.hit == null) {
                bestMatch = { score, hit: result};

                // Step of optimization:
                // Stop this loop if the best possible was found.
                // Thats the case for when the score reaches 0
                if(score <= 0) break;
            }
        }

        return bestMatch.hit?.id;
    }

}