import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { RateCardModule } from '../ratecards/ratecard.module';
import { QuoteService } from './quote.service';

@Module({
    imports: [RateCardModule],
    controllers: [QuoteController],
    providers: [QuoteService],
})
export class QuoteModule { }
