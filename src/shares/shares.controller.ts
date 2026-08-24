import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SharesService } from './shares.service';
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  
}
