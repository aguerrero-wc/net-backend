import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Get()
  // findAll(@Query('tenantId') tenantId: string) {
  //   return this.usersService.findAll(tenantId);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
  //   return this.usersService.findOne(id, tenantId);
  // }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Query('tenantId') tenantId: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(id, tenantId, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
  //   return this.usersService.remove(id, tenantId);
  // }
} 