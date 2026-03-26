import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  listUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.admin.listUsers(Number(page), Number(limit));
  }

  @Patch('users/:id/ban')
  toggleBan(@Param('id', ParseIntPipe) id: number) {
    return this.admin.toggleBan(id);
  }

  @Get('books')
  listBooks(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.admin.listBooks(Number(page), Number(limit));
  }

  @Delete('books/:id')
  deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteBook(id);
  }

  @Get('photo-words')
  listPhotoWords(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.admin.listPhotoWords(Number(page), Number(limit));
  }

  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  @Get('config')
  getConfig() {
    return this.admin.getConfig();
  }

  @Patch('config')
  updateConfig(@Body() body: { key: string; value: string }[]) {
    return this.admin.updateConfig(body);
  }
}
