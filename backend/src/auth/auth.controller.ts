import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { VerifyEmailDto } from 'src/users/dto/verifyEmail.dto';
import { GetUser } from './decorators/getUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { LoginUserDto } from './dto/loginUser.dto';
import { Request } from 'express';
import { IsPublic } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changeUserPassword.dto';

@Controller('api/v1/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  public async createNewUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createSinlgeUser(createUserDto);
  }

  @IsPublic()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    return await this.authService.loginUser(loginUserDto, user, req);
  }

  @IsPublic()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  public async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  public async resendVerifyEmail(@GetUser() user: User) {
    return await this.authService.ResendVerifyEmail(user);
  }

  @IsPublic()
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  public async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    return await this.authService.refreshToken(refreshTokenDto, user.id, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'User logged out' })
  public async logout(
    @GetUser() user: User,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return await this.authService.logout(user.id, refreshTokenDto.refreshToken);
  }

  @Post('logout-all-sessions')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user from all sessions' })
  @ApiResponse({
    status: 200,
    description: 'User logged out from all sessions',
  })
  public async logoutAllSessions(@GetUser() user: User) {
    return this.authService.logoutAllSessions(user.id);
  }

  @IsPublic()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send forgot password email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Forgot password email sent' })
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @IsPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  public async resetpassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  public async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(user.email, changePasswordDto);
  }
}
