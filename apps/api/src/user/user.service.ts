import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePageable, Page } from 'nestjs-pager';
import { ILike, In, Repository } from 'typeorm';
import { KeycloakTokenPayload } from '../authentication/entities/oidc-token.entity';
import { MeiliUserService } from '../meilisearch/services/meili-user.service';
import { MeilisearchFlag } from '../utils/entities/meilisearch.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    private readonly _logger: Logger = new Logger(UserService.name);

    constructor(
        private readonly meiliClient: MeiliUserService,
        @InjectRepository(User) public readonly repository: Repository<User>
    ) {}

    public async findById(userId: string): Promise<User> {
        return this.repository.createQueryBuilder("user")
            .leftJoinAndSelect("user.artwork", "artwork")
            .where("user.id = :userId", { userId })
            .getOne();
    }

    public async findOrCreateByTokenPayload(token: KeycloakTokenPayload): Promise<User> {
        // TODO: Support not only keycloak
        if(!token) return null;

        // Find in database and return if found
        const existingUser = await this.findById(token.sub);
        if(existingUser) {
            if(this.hasUpdated(token, existingUser)) {
                // Update username (currently the only thing that can change which is important)
                existingUser.name = token.preferred_username?.trim();
                return this.save(existingUser).catch((error) => {
                    this._logger.error(`Could not update user object, using old account data: ${error.message}`, error.stack);
                    return existingUser;
                })
            }

            // Update user in meilisearch
            if(this.meiliClient.isSyncRecommended(existingUser)) {
                this.sync([existingUser]);
            }
            
            return existingUser
        }

        // Build new database entry
        const user = new User();
        user.id = token.sub;
        user.name = token.name ?? token.preferred_username?.trim();

        return this.createIfNotExists(user);
    }

    /**
     * Save an user entity.
     * @param user Entity data to be saved
     * @returns User
     */
    public async save(user: User): Promise<User> {
        return this.repository.save(user).then((result) => {
            this.sync([result]);
            return result;
        });
    }

    public async createIfNotExists(user: User): Promise<User> {
        return this.repository.createQueryBuilder("user")
            .insert()
            .values(user)
            .orUpdate(["name"], ["id"], { skipUpdateIfNoValuesChanged: true })
            .returning(["id"])
            .execute().then((insertResult) => {
                const id = insertResult.raw[0]?.["id"];
                return this.findById(id);
            });
    }

    /**
     * Update the sync flag of an user.
     * @param idOrObject Id or object of the user
     * @param flag Updated sync flag
     * @returns User
     */
    public async setSyncFlags(resources: User[], flag: MeilisearchFlag) {
        const ids = resources.map((user) => user.id);

        return this.repository.createQueryBuilder()
            .update({
                meilisearch: {
                    syncedAt: new Date(),
                    flag: flag
                }
            })
            .where({ id: In(ids) })
            .execute();
    }

    /**
     * Resolve an id or object to an user object.
     * @param idOrObject User id or object
     * @returns User
     */
     protected async resolveUser(idOrObject: string | User): Promise<User> {
        if(typeof idOrObject == "string") {
            return this.findById(idOrObject);
        }

        return idOrObject;
    }

    /**
     * Synchronize the corresponding document on meilisearch.
     * @param resources User data
     * @returns User
     */
    public async sync(resources: User[]) {
        return this.meiliClient.setUsers(resources).then(() => {
            return this.setSyncFlags(resources, MeilisearchFlag.OK);
        }).catch(() => {
            return this.setSyncFlags(resources, MeilisearchFlag.FAILED);
        });
    }

    public async findBySearchQuery(query: string, pageable: BasePageable): Promise<Page<User>> {
        if(!query || query == "") {
            query = "%"
        } else {
            query = `%${query.replace(/\s/g, '%')}%`;
        }

        const result = await this.repository.findAndCount({ where: { name: ILike(query) }, skip: pageable.offset, take: pageable.limit});
        return Page.of(result[0], result[1], pageable.offset);
    }

    private hasUpdated(token: KeycloakTokenPayload, existingUser: User): boolean {
        if(token.sub != existingUser.id) return false;
        return token.preferred_username !== existingUser.name;
    }

}
