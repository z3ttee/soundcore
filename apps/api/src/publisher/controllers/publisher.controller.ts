import { Controller } from '@nestjs/common';
import { PublisherService } from '../services/publisher.service';

@Controller('publishers')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}
}
