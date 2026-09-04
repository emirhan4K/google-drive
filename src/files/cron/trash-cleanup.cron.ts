import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TrashCleanupCron implements OnModuleInit { //Bu sınıf sunucu başlatığında otomatik olarak çalışcak 
  private readonly logger = new Logger(TrashCleanupCron.name);

  constructor(
    @InjectQueue('file-optimization') private readonly optimizationQueue: Queue,
  ) {}

  async onModuleInit() {
      await this.optimizationQueue.add(
      'clean-trash', //Yapılacak işin adı
      {}, //Data
      {
        repeat: {
          every: 24 * 60 * 60 * 1000, //Her 24 saatte bir çalışacak şekilde ayarladık
        },
      } as any
    );
    this.logger.log('🧹 Çöp Kutusu Otomatik Temizlik görevi kuyruğa eklendi.');
  }
}