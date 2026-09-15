import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchService.name);
  private redisClient: RedisClientType; //Otomatik tamamlama sağlar

  constructor() {
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6380}`
    });

    this.redisClient.on('error', (err) => this.logger.error('Redis Bağlantı Hatası:', err));
  }

  async onModuleInit() { //Proje başladığında ilk çalışacak kısım
    await this.redisClient.connect();
    this.logger.log('RediSearch motoruna başarıyla bağlanıldı! 🚀');
    await this.createFileIndex();
  }

  async onModuleDestroy() { //Sunucuyu durdurduğumuzda devreye girer ve açık kalan redis bağlantılarını kapatır.
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
      await this.redisClient.ft.create('idx:files', searchSchema as any, { //idx:files oluşturduğumuz indexin adı   
        ON: 'JSON', //Gidip bütün Redis'i tarama, sadece JSON formatında kaydedilmiş verileri tara
        PREFIX: 'file:' //adı sadece file ile başlayan verilerle ilgilen diyoruz
      });
      
      this.logger.log('Dosya arama indeksi başarıyla oluşturuldu! 🔍');
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('already exists') || errorMessage.includes('SEARCH_INDEX_EXISTS')) {
        this.logger.log('Arama indeksi zaten mevcut, atlanıyor.');
      } else {
        this.logger.error('İndeks oluşturulurken kritik hata:', error);
      }
    }
  }
  async addFileToIndex(fileId: string, name: string, extension: string, size: number) {
    try {
      const document = {
        name,
        extension,
        size
      };
      await this.redisClient.json.set(`file:${fileId}`, '$', document);
      
      this.logger.log(`🔍 Arama motoruna eklendi: file:${fileId}`);
    } catch (error) {
      this.logger.error(`Dosya indekse eklenirken hata oluştu: ${error}`);
    }
  }
}