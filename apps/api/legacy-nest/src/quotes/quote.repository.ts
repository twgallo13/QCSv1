export type QuoteTotals = Record<string, number>;

export interface QuoteRecord {
  id: string;
  rateCardId?: string;
  scopeInput: any;
  totalsCents: QuoteTotals;
  createdAt: string;
}

export interface IQuoteRepository {
  save(q: Omit<QuoteRecord, 'id'|'createdAt'> & { id?: string }): Promise<QuoteRecord>;
  get(id: string): Promise<QuoteRecord | null>;
  list(): Promise<QuoteRecord[]>;
}
