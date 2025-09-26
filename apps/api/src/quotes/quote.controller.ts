import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuoteService, ScopeInput } from './quote.service';

@Controller('quotes')
export class QuoteController {
    constructor(private readonly quotes: QuoteService) { }

    @Post('preview')
    preview(@Body() body: { rateCardId: string; scopeInput: ScopeInput }) {
        return this.quotes.preview(body.rateCardId, body.scopeInput);
    }

    @Post()
    save(@Body() body: { rateCardId: string; scopeInput: ScopeInput }) {
        return this.quotes.save(body.rateCardId, body.scopeInput);
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.quotes.get(id);
    }

    @Get(':id/preview-newer')
    previewNewer(@Param('id') id: string) {
        return this.quotes.previewNewer(id);
    }
}
