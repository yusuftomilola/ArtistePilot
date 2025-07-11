import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { CreateUserDto } from '../dto/createUser.dto';
import { UserCrudActivitiesProvider } from './userCrud.provider';
import { EmailVerificationTokenProvider } from './emailVerificationToken.provider';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailProvider } from './verifyEmail.provider';
import { VerifyEmailDto } from '../dto/verifyEmail.dto';
import { User } from '../entities/user.entity';
import { ResendEmailVerificationProvider } from './resendVerifyEmail.provider';
import { FindOneUserByEmailProvider } from './findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class UsersService {
  constructor(
    private readonly userCrudActivities: UserCrudActivitiesProvider,

    private readonly emailVerificationTokenProvider: EmailVerificationTokenProvider,

    private readonly emailService: EmailService,

    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly resendVerifyEmailProvider: ResendEmailVerificationProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly findOneUserByIdProvider: FindOneUserByIdProvider,
  ) {}

  // FIND ONE USER BY EMAIL
  public async findOneUserByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findUserByEmail(email);
  }

  // FIND ONE USER BY ID
  public async findOneUserById(id: string) {
    return await this.findOneUserByIdProvider.findOneUserById(id);
  }

  // CREATE A SINGLE USER
  public async createSingleUser(createUserDto: CreateUserDto) {
    const user = await this.userCrudActivities.createSingleUser(createUserDto);

    const emailVerificationToken =
      await this.emailVerificationTokenProvider.getEmailVerificationToken(user);

    await this.emailService.sendVerificationEmail(user, emailVerificationToken);

    return user;
  }

  // UPDATE A SINGLE USER
  public async updateSingleUser(updateUserDto: UpdateUserDto, userId: string) {
    return await this.userCrudActivities.updateSinlgeUser(
      updateUserDto,
      userId,
    );
  }

  // DELETE A SINGLE USER
  public async deleteSingleUser(userId: string) {
    return await this.userCrudActivities.deleteSinlgeUser(userId);
  }

  // VERIFY USER EMAIL
  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.verifyEmailProvider.verifyEmail(verifyEmailDto);
  }

  // RESEND VERIFY USER EMAIL
  public async resendVerifyEmail(user: User) {
    return await this.resendVerifyEmailProvider.resendEmailVerification(user);
  }
}
