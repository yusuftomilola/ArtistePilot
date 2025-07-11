import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { VerifyEmailDto } from 'src/users/dto/verifyEmail.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/providers/users.service';
import { ValidateUserProvider } from './validateUser.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly validateUserProvider: ValidateUserProvider,
  ) {}

  // CREATE A NEW USER
  public async createSinlgeUser(createUserDto: CreateUserDto) {
    return await this.usersService.createSingleUser(createUserDto);
  }

  // VERIFY EMAIL
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY EMAIL
  public async ResendVerifyEmail(user: User) {
    return await this.usersService.resendVerifyEmail(user);
  }

  // VALIDATE USER
  public async validateUser(email: string, password: string) {
    return await this.validateUserProvider.validateUser(email, password);
  }
}
