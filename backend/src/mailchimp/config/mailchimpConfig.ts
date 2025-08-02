import { registerAs } from '@nestjs/config';

export default registerAs('mailchimp', () => {
  return {
    audienceID: process.env.MAILCHIMP_AUDIENCE_ID,
    apiKey: process.env.MAILCHIMP_API_KEY,
  };
});
