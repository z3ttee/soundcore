import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page, Pageable } from 'nestjs-pager';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CreateNotificationDTO } from '../dtos/notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
export class NotificationService {

    constructor(
        private readonly gateway: NotificationGateway,
        @InjectRepository(Notification) private readonly repository: Repository<Notification>
    ) {}

    public async findByCurrentUser(authentication: User, pageable: Pageable): Promise<Page<Notification>> {
        const result = await this.repository.createQueryBuilder("notification")
            .leftJoin("notification.targets", "target")

            .loadRelationCountAndMap("notification.hasRead", "notification.readBy", "readBy", (qb) => qb.where("readBy.id = :userId", { userId: authentication.id }))

            .orderBy("notification.sentAt", "DESC")
            .where("notification.isBroadcast = :isBroadcast OR target.id = :targetId", { isBroadcast: 1, targetId: authentication.id })
            .getManyAndCount();

        return Page.of(result[0], result[1], pageable.page)
    }

    public async createNotification(createNotificationDto: CreateNotificationDTO): Promise<Notification> {
        const notification = new Notification();
        notification.title = createNotificationDto.title;
        notification.message = createNotificationDto.message;

        if(!createNotificationDto.isBroadcast) {
            if(notification.targets.length <= 0) throw new BadRequestException("You need to define at least one target user, as the notification is not handled as broadcast.")
            notification.targets = createNotificationDto.targets;
            notification.isBroadcast = false;
        } else {
            notification.isBroadcast = true;
            notification.targets = [];
        }

        return this.repository.save(notification).then((result) => {
            this.gateway.sendNotification(notification);
            return result;
        })
        
    }

}
