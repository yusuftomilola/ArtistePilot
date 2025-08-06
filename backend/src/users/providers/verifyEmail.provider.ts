import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { VerifyEmailDto } from '../dto/verifyEmail.dto';
import { User } from '../entities/user.entity';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VerifyEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    // find the user
    const user = await this.usersRepository.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // check if the token exists and if it has not expired
    if (
      !user.emailVerificationToken ||
      !user.emailVerificationExpiresIn ||
      user.emailVerificationExpiresIn < new Date()
    ) {
      throw new BadRequestException(
        'Email verification token invalid or expired',
      );
    }

    try {
      user.isEmailVerified = true;
      user.emailVerificationExpiresIn = null;
      user.emailVerificationToken = null;

      await this.usersRepository.save(user);
    } catch (error) {
      if (
        error.name === 'ErrorQueryFailed' &&
        error.message.includes('timeout')
      ) {
        throw new RequestTimeoutException(
          'Your request timed out. Kindly try again later',
        );
      }

      throw new InternalServerErrorException(
        'Failed to save due to server error',
      );
    }

    return {
      status: true,
      message: 'Email verified successfully',
      user: {
        userId: user.id,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
