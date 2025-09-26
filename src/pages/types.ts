export interface UserProfile {
  id: number;
  username?: string; // เพิ่มอันนี้
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birthday: string;
  address: string;
  profile_image: string;
  preferences: {
    language: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    product_updates: boolean;
    security: boolean;
    partner_info: boolean;
  };
}
