import { Injectable } from '@nestjs/common';
import { IQuoteRepository } from './quote.repository';
import { quoteBreakdown } from '../../../packages/calc/src/index.js';
import { rateCards } from '../data.js';

@Injectable()
export class QuoteService {
  constructor(private readonly repo: IQuoteRepository) {}

  async preview(dto: any) {
    const { rateCardId, scopeInput } = dto ?? {};
    const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
    return quoteBreakdown(scopeInput || {}, rateCard);
  }

  async createQuote(dto: any) {
    const { rateCardId, scopeInput } = dto ?? {};
    const preview = await this.preview(dto);
    const saved = await this.repo.save({
      rateCardId,
      scopeInput,
      totalsCents: preview.totalsCents ?? preview
    });
    return saved;
  }

  async getQuote(id: string) { 
    return this.repo.get(id); 
  }
  
  async listQuotes() { 
    return this.repo.list(); 
  }
}
