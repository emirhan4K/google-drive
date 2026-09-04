import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ICacheService } from './cache.service.abstract';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class KeyvCacheService implements ICacheService, OnModuleDestroy {
  private keyv: Keyv;
  constructor() {
    const keyvRedis = new KeyvRedis('redis://localhost:6379'); // Redis bağlantısı için KeyvRedis kullanıyoruz
    this.keyv = new Keyv({ store: keyvRedis }); // Keyv'yi Redis ile kullanmak için store olarak KeyvRedis'i belirtiyoruz
    this.keyv.on('error', (err) => console.error('Keyv Cache Hatası:', err));
  }

  async get<T>(key: string): Promise<T | null> { 
    const data = await this.keyv.get(key);
    return data ? (data as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> { 
    const ttlMilliseconds = ttlSeconds ? ttlSeconds * 1000 : undefined; //Keyv TTL milisaniye cinsinden alır, bu yüzden saniyeyi milisaniyeye çeviriyoruz
    await this.keyv.set(key, value, ttlMilliseconds);
  }

  async delete(key: string): Promise<void> {
    await this.keyv.delete(key);
  }

  async onModuleDestroy() { // Uygulama kapanırken Keyv bağlantısını kapatmak için
    await this.keyv.disconnect();
  }
}