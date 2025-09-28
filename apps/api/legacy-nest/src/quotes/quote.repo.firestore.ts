import { IQuoteRepository, QuoteRecord } from './quote.repository';

let db: FirebaseFirestore.Firestore | null = null;
function ensureDb() {
  if (db) return db;
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    // Credentials: prefer GOOGLE_APPLICATION_CREDENTIALS, otherwise decode FIREBASE_SERVICE_ACCOUNT_B64
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
    } else {
      const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
      if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 missing');
      const json = Buffer.from(b64, 'base64').toString('utf8');
      const cred = admin.credential.cert(JSON.parse(json));
      admin.initializeApp({ credential: cred, projectId: process.env.FIREBASE_PROJECT_ID });
    }
  }
  db = admin.firestore();
  return db!;
}

const COLL = 'quotes';

export class FirestoreQuoteRepository implements IQuoteRepository {
  #col() { return ensureDb().collection(COLL); }

  async save(q: Omit<QuoteRecord, 'id'|'createdAt'> & { id?: string }): Promise<QuoteRecord> {
    const id = q.id ?? Math.random().toString(36).slice(2,10);
    const rec: QuoteRecord = { id, rateCardId: q.rateCardId, scopeInput: q.scopeInput, totalsCents: q.totalsCents, createdAt: new Date().toISOString() };
    await this.#col().doc(id).set(rec, { merge: false });
    return rec;
  }
  async get(id: string): Promise<QuoteRecord | null> {
    const snap = await this.#col().doc(id).get();
    return snap.exists ? (snap.data() as QuoteRecord) : null;
  }
  async list(): Promise<QuoteRecord[]> {
    const qs = await this.#col().orderBy('createdAt','desc').limit(100).get();
    return qs.docs.map(d => d.data() as QuoteRecord);
  }
}
