import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchService.name);
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6380}`
    });

    this.redisClient.on('error', (err) => this.logger.error('Redis Bağlantı Hatası:', err));
  }

  async onModuleInit() {
    await this.redisClient.connect();
    this.logger.log('RediSearch motoruna başarıyla bağlanıldı! 🚀');
    await this.createFileIndex();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private async createFileIndex() {
    try {
      const searchSchema = {
        '$.name': { type: 'TEXT', AS: 'name', sortable: true },
        '$.extension': { type: 'TAG', AS: 'extension' },
        '$.size': { type: 'NUMERIC', AS: 'size' }
      };
      await this.redisClient.ft.create('idx:files', searchSchema as any, {
        ON: 'JSON',
        PREFIX: 'file:' 
      });
      
      this.logger.log('Dosya arama indeksi başarıyla oluşturuldu! 🔍');
    } catch (error) {
      const errorMessage = String(error);
      if (errorMessage.includes('Index already exists')) {
        this.logger.log('Arama indeksi zaten mevcut, atlanıyor.');
      } else {
        this.logger.error('İndeks oluşturulurken kritik hata:', error);
      }
    }
  }
}