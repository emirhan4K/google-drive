import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { STORAGE_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { StorageSchema } from './schema/storage.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:STORAGE_TOKEN_CONSTANTS,schema:StorageSchema}])],
  providers: [StorageService]
})
export class StorageModule {}
