import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { VerifyEmailDto } from 'src/users/dto/verifyEmail.dto';
import { GetUser } from './decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // CREATE A NEW USER
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async createNewUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createSinlgeUser(createUserDto);
  }

  // VERIFY EMAIL
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  public async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY EMAIL
  @Post('resend-verify-email')
  @HttpCode(HttpStatus.OK)
  public async resendVerifyEmail(@GetUser() user: User) {
    return await this.authService.ResendVerifyEmail(user);
  }
}
