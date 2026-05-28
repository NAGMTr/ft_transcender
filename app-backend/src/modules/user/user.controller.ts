import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { AdmUpdateUserDto } from './dto/admin-update-user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: AdmUpdateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch('me')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  admUpdate(@Param('id') id: string, @Body() dto: AdmUpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete('me')
  remove(@Req() req) {
    return this.userService.remove(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req, @Body dto: ) {
    return this.userService.remove(req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  admRemove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
