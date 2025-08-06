import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { MoreThan, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPasswordDto } from 'src/auth/dto/resetPassword.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly emailService: EmailService,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      !user?.passwordResetToken ||
      !user.passwordResetExpiresIn ||
      user.passwordResetExpiresIn < new Date()
    ) {
      throw new BadRequestException(
        'Password reset token is invalid or has expired',
      );
    }

    user.password = await this.hashingProvider.hash(password);
    user.passwordResetToken = null;
    user.passwordResetExpiresIn = null;

    await this.usersRepository.save(user);

    // send reset password confirmation message
    await this.emailService.sendPasswordResetSuccessConfirmationEmail(user);

    return {
      status: true,
      message: 'Password reset successful',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
