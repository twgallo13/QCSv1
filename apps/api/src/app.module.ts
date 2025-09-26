import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatecardModule } from './ratecards/ratecard.module';
import { QuoteModule } from './quotes/quote.module';

@Module({
  imports: [RatecardModule, QuoteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
