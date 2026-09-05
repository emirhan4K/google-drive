import { Controller, Patch, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterOptions } from 'src/config/multer.config'; 
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guards';
import { MagicNumberValidationPipe } from 'src/files/pipes/magic-number-validation.pipe';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('avatar', getMulterOptions('avatar', true)))
  async uploadAvatar(
    @UploadedFile(new MagicNumberValidationPipe()) file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.id;
    return await this.usersService.updateAvatar(userId, file.filename);
  }
}