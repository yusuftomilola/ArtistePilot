import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refreshToken.entity';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { ValidateUserProvider } from './providers/validateUser.provider';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    ValidateUserProvider,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
