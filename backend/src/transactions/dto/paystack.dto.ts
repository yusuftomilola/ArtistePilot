export interface PaystackCreateTransactionDto {
  amount: number;
  email: string;
  callback_url?: string;
  metadata: PaystackMetadata;
}

export interface PaystackCreateTransactionResponseDto {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyTransactionResponseDto {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
  };
}

export interface PaystackMetadata {
  user_id: string;
  product_id: number;
  callback_url?: string;
  custom_fields: PaystackMetadataCustomField[];
}

export interface PaystackMetadataCustomField {
  display_name: string;
  variable_name: string;
  value: string | number;
}

export interface PaystackWebhookDto {
  event: string;
  data: Data;
}

export interface PaystackCallbackDto {
  reference: string;
}

export interface Data {
  id?: number;
  domain?: string;
  status?: string;
  reference?: string;
  amount?: number;

  gateway_response?: string;
  paid_at?: string;
  created_at?: string;
  channel?: string;
  currency?: string;
  ip_address?: string;
  metadata?: any;

  message?: any;
  fees: any;
  log: any;
  customer: any;
  authorization: any;
  plan: any;
}
