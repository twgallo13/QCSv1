import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuoteService } from './quote.service';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  list() { 
    return this.quoteService.listQuotes(); 
  }

  @Get(':id')
  get(@Param('id') id: string) { 
    return this.quoteService.getQuote(id); 
  }

  @Post()
  create(@Body() body: any) { 
    return this.quoteService.createQuote(body); 
  }

  @Post('preview')
  preview(@Body() body: any) {
    return this.quoteService.preview(body);
  }
}
