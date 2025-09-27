import { Module, Provider } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { IQuoteRepository } from './quote.repository';
import { MemoryQuoteRepository } from './quote.repo.memory';

const repoProvider: Provider = {
  provide: 'QUOTE_REPO',
  useFactory: async () => {
    if (process.env.USE_FIREBASE === 'true') {
      const { FirestoreQuoteRepository } = await import('./quote.repo.firestore');
      return new FirestoreQuoteRepository();
    }
    return new MemoryQuoteRepository();
  },
};

@Module({
  controllers: [QuoteController],
  providers: [
    QuoteService,
    { provide: IQuoteRepository as any, useExisting: 'QUOTE_REPO' as any },
    repoProvider,
  ],
  exports: [QuoteService],
})
export class QuoteModule {}
