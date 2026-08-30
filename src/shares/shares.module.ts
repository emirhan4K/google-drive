import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import {SharesSchema } from './schema/shares-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SHARES_TOKEN_CONSTANTS } from 'src/config/db.constants';

@Module({
  imports:[
    MongooseModule.forFeature([{name:SHARES_TOKEN_CONSTANTS,schema:SharesSchema}])
  ],
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}
