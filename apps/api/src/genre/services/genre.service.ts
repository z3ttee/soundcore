import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateResult } from '../../utils/results/creation.result';
import { CreateGenreDTO } from '../dtos/create-genre.dto';
import { UpdateGenreDTO } from '../dtos/update-genre.dto';
import { Genre } from '../entities/genre.entity';

@Injectable()
export class GenreService {
    private readonly logger: Logger = new Logger(GenreService.name)

    constructor(
        @InjectRepository(Genre) private readonly repository: Repository<Genre>
    ) {}

    /**
     * Find a page of genres
     * @param pageable Page settings
     * @returns Page<Genre>
     */
    public async findAll(pageable: Pageable): Promise<Page<Genre>> {
        const result = await this.buildGeneralQuery("genre")
            .skip(pageable.page * pageable.size)
            .take(pageable.size)
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
    }

    /**
     * Find a genre by its id.
     * @param genreId Id of the genre
     * @returns Genre
     */
    public async findById(genreId: string): Promise<Genre> {
        return this.buildGeneralQuery("genre")
            .where("genre.id = :genreId OR genre.slug = :genreId", { genreId })
            .getOne();
    }

    /**
     * Find a genre by its name.
     * @param name Name of the genre
     * @returns Genre
     */
    public async findByName(name: string): Promise<Genre> {
        return this.buildGeneralQuery("genre")
            .where("genre.name = :name", { name })
            .getOne();
    }

    /**
     * Find a genre of an artist.
     * This will lookup the songs of an artist in database and
     * out of the songs relation to a genre a page of genres
     * is generated.
     * @param artistIdOrSlug Id or slug of the artist
     * @param pageable Page settings
     * @returns Page<Genre>
     */
    public async findByArtist(artistIdOrSlug: string, pageable: Pageable): Promise<Page<Genre>> {
        const result = await this.repository.createQueryBuilder("genre")
            .leftJoin("genre.songs", "song")
            .leftJoin("song.artists", "artist")

            .limit(pageable.size || 30)
            .offset((pageable.page || 0) * (pageable.size || 30))

            .where("artist.id = :artistIdOrSlug OR artist.slug = :artistIdOrSlug", { artistIdOrSlug })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page);
    }

    /**
     * Create new genre by name if it does not already exist in the database.
     * @param createGenreDto Genre data to create
     * @returns Genre
     */
     public async createIfNotExists(createGenreDto: CreateGenreDTO): Promise<CreateResult<Genre>> {
        createGenreDto.name = createGenreDto.name.trim();
        createGenreDto.description = createGenreDto.description?.trim();

        const existingGenre = await this.findByName(createGenreDto.name);
        if(existingGenre) return new CreateResult(existingGenre, true); 

        const genre = this.repository.create();
        genre.name = createGenreDto.name;
        genre.geniusId = createGenreDto.geniusId;
        genre.description = createGenreDto.description;

        return this.repository.createQueryBuilder()
            .insert()
            .values(genre)
            .orIgnore()
            .execute().then((result) => {
                if(result.identifiers.length > 0) {
                    return new CreateResult(genre, false);
                }
                return this.findByName(createGenreDto.name).then((genre) => new CreateResult(genre, true));
            }).catch((error) => {
                this.logger.error(`Could not create database entry for genre: ${error.message}`, error.stack);
                return null
            })
    }

    /**
     * Update genre data
     * @param genreId Id of the genre
     * @param updateGenreDto Updated genre data
     * @returns Genre
     */
    public async update(genreId: string, updateGenreDto: UpdateGenreDTO): Promise<Genre> {
        updateGenreDto.name = updateGenreDto.name.trim();
        updateGenreDto.description = updateGenreDto.description?.trim();

        const genre = await this.findById(genreId);
        if(!genre) throw new NotFoundException("Genre not found.");

        genre.name = updateGenreDto.name;
        genre.geniusId = updateGenreDto.geniusId;
        genre.description = updateGenreDto.description;
        return this.repository.save(genre);
    }

    private buildGeneralQuery(alias: string): SelectQueryBuilder<Genre> {
        return this.repository.createQueryBuilder(alias)
            .leftJoin(`${alias}.artwork`, "artwork").addSelect(["artwork.id"])
    }

}
