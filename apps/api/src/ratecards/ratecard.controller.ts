import { Controller, Get } from '@nestjs/common';
import { RateCardService, RateCardDefinition } from './ratecard.service';

@Controller('ratecards')
export class RateCardController {
    constructor(private readonly rateCardService: RateCardService) { }

    @Get()
    list(): RateCardDefinition[] {
        return this.rateCardService.listLatest();
    }
}
