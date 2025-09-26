import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RatecardService } from './ratecard.service';

@Controller('ratecards')
export class RatecardController {
    constructor(private readonly svc: RatecardService) { }

    @Get() list() { return this.svc.list(); }
    @Get('latest') latest() { return this.svc.latest(); }
    @Get(':id') byId(@Param('id') id: string) {
        const item = this.svc.getById(id);
        return item ? { item } : { ok: false, error: 'not_found' };
    }
    @Post() create(@Body() body: any) { return this.svc.createDraft(body || {}); }
}
