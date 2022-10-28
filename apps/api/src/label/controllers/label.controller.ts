import { Controller } from '@nestjs/common';
import { LabelService } from '../services/label.service';

@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}
}
