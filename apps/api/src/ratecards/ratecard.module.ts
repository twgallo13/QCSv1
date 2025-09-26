import { Module } from '@nestjs/common';
import { RateCardService } from './ratecard.service';
import { RateCardController } from './ratecard.controller';

@Module({
    providers: [RateCardService],
    controllers: [RateCardController],
    exports: [RateCardService],
})
export class RateCardModule { }
