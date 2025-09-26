import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { RatecardModule } from '../ratecards/ratecard.module';

@Module({
    imports: [RatecardModule],
    controllers: [QuoteController],
    providers: [QuoteService],
})
export class QuoteModule {}
