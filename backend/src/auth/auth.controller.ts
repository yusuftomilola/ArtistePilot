import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { VerifyEmailDto } from 'src/users/dto/verifyEmail.dto';
import { GetUser } from './decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { LoginUserDto } from './dto/loginUser.dto';
import { Request } from 'express';
import { IsPublic } from './decorators/public.decorator';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // CREATE A NEW USER
  @IsPublic()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async createNewUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createSinlgeUser(createUserDto);
  }

  // LOGIN USER
  @IsPublic()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    return await this.authService.loginUser(loginUserDto, user, req);
  }

  // VERIFY EMAIL
  @IsPublic()
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
