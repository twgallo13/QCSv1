import { IQuoteRepository, QuoteRecord } from './quote.repository';

const store: QuoteRecord[] = [];

export class MemoryQuoteRepository implements IQuoteRepository {
  async save(q: Omit<QuoteRecord, 'id'|'createdAt'> & { id?: string }): Promise<QuoteRecord> {
    const id = q.id ?? Math.random().toString(36).slice(2,10);
    const rec: QuoteRecord = { id, rateCardId: q.rateCardId, scopeInput: q.scopeInput, totalsCents: q.totalsCents, createdAt: new Date().toISOString() };
    const i = store.findIndex(s => s.id === id);
    if (i >= 0) store[i] = rec; else store.push(rec);
    return rec;
  }
  async get(id: string): Promise<QuoteRecord | null> {
    return store.find(s => s.id === id) ?? null;
  }
  async list(): Promise<QuoteRecord[]> {
    return [...store].sort((a,b)=> (a.createdAt<b.createdAt?1:-1));
  }
}
