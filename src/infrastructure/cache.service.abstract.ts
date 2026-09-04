export abstract class ICacheService {
  
  /**
   * Önbellekten veri okumak için kullanacağımız standart metodumuz.
   * @param key Aranacak verinin anahtarı
   * @returns Bulunursa veriyi, bulunamazsa null döner
   */
  abstract get<T>(key: string): Promise<T | null>;

  /**
   * Önbelleğe yeni veri yazmak için kullanacağımız standart metodumuz.
   * @param key Kaydedilecek verinin anahtarı
   * @param value Kaydedilecek verinin kendisi
   * @param ttlSeconds Verinin önbellekte kalacağı süre
   */
  abstract set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Önbellekteki bir veriyi silmek için kullanacağımız standart metodumuz.
   * @param key Silinecek verinin anahtarı
   */
  abstract delete(key: string): Promise<void>;
  
}