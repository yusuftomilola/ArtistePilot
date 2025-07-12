import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { FindOneUserByIdProvider } from './findOneUserById.provider';

@Injectable()
export class GetUserProfileProvider {
  constructor(private readonly findUserByIdProvider: FindOneUserByIdProvider) {}

  public async getUserProfile(user: User) {
    const userDetails = await this.findUserByIdProvider.findOneUserById(
      user.id,
    );

    return userDetails;
  }
}
