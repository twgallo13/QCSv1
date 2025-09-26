import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RateCardModule } from './ratecards/ratecard.module';
import { QuoteModule } from './quotes/quote.module';

@Module({
  imports: [RateCardModule, QuoteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
