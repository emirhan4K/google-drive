import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { USERS_TOKEN_CONSTANTS } from 'src/config/db.constants';
import { UserSchema } from './schema/user.schema';
import { BullModule } from '@nestjs/bullmq';
import { AvatarOptimizationWorker } from './worker/avatar-optimization.worker';

@Module({
    imports: [
      BullModule.registerQueue({
        name: 'avatar-optimization',
      }),
    MongooseModule.forFeature([
      { name: USERS_TOKEN_CONSTANTS, schema: UserSchema }
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService,AvatarOptimizationWorker],

})
export class UsersModule {}
