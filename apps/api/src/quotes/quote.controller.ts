import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { RatecardService } from '../ratecards/ratecard.service';

@Controller('quotes')
export class QuoteController {
    constructor(
        private readonly quotes: QuoteService,
        private readonly ratecards: RatecardService,
    ) { }

    @Post('preview')
    preview(@Body() body: any) {
        const { rateCardId, scope, scopeInput } = body || {};
        const rc = this.ratecards.getById(rateCardId) || this.ratecards.latest().item;
        return this.quotes.preview(rc as any, scope || scopeInput || {});
    }

    @Post()
    create(@Body() body: any) {
        const { rateCardId, scope, scopeInput } = body || {};
        const rc = this.ratecards.getById(rateCardId) || this.ratecards.latest().item;
        return this.quotes.create(rc as any, scope || scopeInput || {});
    }

    @Get(':id')
    byId(@Param('id') id: string) {
        const rec = this.quotes.get(id);
        return rec ?? { ok: false, error: 'not_found' };
    }

    @Get(':id/preview-newer')
    previewNewer(@Param('id') id: string) {
        const rec = this.quotes.get(id);
        if (!rec) return { ok: false, error: 'not_found' };
        const latest = this.ratecards.latest().item;
        return this.quotes.preview(latest as any, rec.input);
    }
}
