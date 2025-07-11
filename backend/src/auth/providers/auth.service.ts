import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { VerifyEmailDto } from 'src/users/dto/verifyEmail.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { ValidateUserProvider } from './validateUser.provider';
import { LoginUserProvider } from './loginUser.provider';
import { LoginUserDto } from '../dto/loginUser.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly validateUserProvider: ValidateUserProvider,

    private readonly loginUserProvider: LoginUserProvider,
  ) {}

  // CREATE A NEW USER
  public async createSinlgeUser(createUserDto: CreateUserDto) {
    return await this.usersService.createSingleUser(createUserDto);
  }

  // LOGIN USER
  public async loginUser(loginUserDto: LoginUserDto, user: User, req: Request) {
    return await this.loginUserProvider.loginUser(loginUserDto, user, req);
  }

  // VALIDATE USER
  public async validateUser(email: string, password: string) {
    return await this.validateUserProvider.validateUser(email, password);
  }

  // VERIFY EMAIL
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY EMAIL
  public async ResendVerifyEmail(user: User) {
    return await this.usersService.resendVerifyEmail(user);
  }
}
