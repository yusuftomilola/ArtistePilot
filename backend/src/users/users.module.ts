import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserCrudActivitiesProvider } from './providers/userCrud.provider';
import { AuthModule } from 'src/auth/auth.module';
import { EmailVerificationTokenProvider } from './providers/emailVerificationToken.provider';
import { GenerateRandomTokenProvider } from './providers/generateRandomToken.provider';
import { EmailModule } from 'src/email/email.module';
import { VerifyEmailProvider } from './providers/verifyEmail.provider';
import { ResendEmailVerificationProvider } from './providers/resendVerifyEmail.provider';
import { FindOneUserByEmailProvider } from './providers/findOneUserByEmail.provider';
import { FindOneUserByIdProvider } from './providers/findOneUserById.provider';
import { ResetPasswordProvider } from './providers/passwordReset.provider';
import { PasswordResetTokenProvider } from './providers/passwordResetToken.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCrudActivitiesProvider,
    EmailVerificationTokenProvider,
    GenerateRandomTokenProvider,
    VerifyEmailProvider,
    ResendEmailVerificationProvider,
    FindOneUserByEmailProvider,
    FindOneUserByIdProvider,
    ResetPasswordProvider,
    PasswordResetTokenProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
