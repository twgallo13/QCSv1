// QCSv1.api — in-memory quote repository (JS runtime)
// Mirrors the TS version (quote.repo.memory.ts)

/**
 * @typedef {Object} QuoteRecord
 * @property {string} id
 * @property {string} rateCardId
 * @property {any}    scopeInput
 * @property {Record<string, number>} totalsCents
 * @property {string} createdAt
 */

const __store = [];

export class MemoryQuoteRepository {
  /**
   * @param {{ id?: string, rateCardId: string, scopeInput: any, totalsCents: Record<string, number> }} q
   * @returns {Promise<QuoteRecord>}
   */
  async save(q) {
    const id = q.id ?? Math.random().toString(36).slice(2, 10);
    const rec = {
      id,
      rateCardId: q.rateCardId,
      scopeInput: q.scopeInput,
      totalsCents: q.totalsCents,
      createdAt: new Date().toISOString(),
    };
    const i = __store.findIndex(s => s.id === id);
    if (i >= 0) __store[i] = rec; else __store.push(rec);
    return rec;
  }

  /** @param {string} id */
  async get(id) {
    return __store.find(s => s.id === id) ?? null;
  }

  /** @returns {Promise<QuoteRecord[]>} */
  async list() {
    return [...__store].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
}

export default MemoryQuoteRepository;

