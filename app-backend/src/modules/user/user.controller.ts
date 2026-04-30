import { Controller, Get, Param, Put, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private services: UserService) {}
  @Get()
  getAll() {
    return this.services.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.services.findOne(id);
  }

  @Post()
  create(@Body() body) {
    return this.services.create(body);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body) {
    return this.services.updateUser(id, body);
  }
}
