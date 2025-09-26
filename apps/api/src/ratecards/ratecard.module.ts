import { Module } from '@nestjs/common';
import { RatecardController } from './ratecard.controller';
import { RatecardService } from './ratecard.service';

@Module({
    controllers: [RatecardController],
    providers: [RatecardService],
    exports: [RatecardService],
})
export class RatecardModule { }
