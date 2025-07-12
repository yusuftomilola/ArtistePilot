import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET USER PROFILE
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  public async getUserProfile(@GetUser() user: User) {
    return await this.usersService.userProfile(user);
  }

  // UPDATE USER PROFILE
  @Patch('profile/update')
  public async updateUserProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(user.id, updateUserDto);
  }

  // GET ALL USERS
  @Get()
  @Roles(UserRole.ADMIN)
  public async getAllUsers() {
    return await this.usersService.getAllUsers();
  }
}
