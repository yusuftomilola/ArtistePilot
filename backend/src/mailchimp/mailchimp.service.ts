import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import mailchimpConfig from './config/mailchimpConfig';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MailchimpService {
  constructor(
    @Inject(mailchimpConfig.KEY)
    private readonly mailchimpConfigurations: ConfigType<
      typeof mailchimpConfig
    >,
  ) {}

  private readonly dc = this.mailchimpConfigurations.apiKey.split('-')[1];

  private getMemberUrl(email: string) {
    const hashedEmail = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    return `https://${this.dc}.api.mailchimp.com/3.0/lists/${this.mailchimpConfigurations.audienceID}/members/${hashedEmail}`;
  }

  public async subscribeUser(email: string) {
    const url = `https://${this.dc}.api.mailchimp.com/3.0/lists/${this.mailchimpConfigurations.audienceID}/members`;

    try {
      await axios.post(
        url,
        {
          email_address: email,
          status: 'subscribed',
        },
        {
          auth: {
            username: 'subscriber',
            password: this.mailchimpConfigurations.apiKey,
          },
        },
      );
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.title === 'Member Exists'
      ) {
        // if user already exists, just resubscribe them
        return this.updateUserStatus(email, 'subscribed');
      }

      throw new InternalServerErrorException('Mailchimp subscription failed');
    }
  }

  public async updateUserStatus(
    email: string,
    status: 'subscribed' | 'unsubscribed',
  ) {
    const url = this.getMemberUrl(email);

    try {
      await axios.patch(
        url,
        {
          status,
        },
        {
          auth: {
            username: 'subscriber',
            password: this.mailchimpConfigurations.apiKey,
          },
        },
      );
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('User not found in Mailchimp');
      }
      throw new InternalServerErrorException('Mailchimp status update failed');
    }
  }
}
