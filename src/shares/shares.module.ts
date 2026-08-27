import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { Shares , SharesSchema } from './schema/shares-schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Shares.name,schema:SharesSchema}])
  ],
  controllers: [SharesController],
  providers: [SharesService],
})
export class SharesModule {}
