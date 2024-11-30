import dotenv from 'dotenv';

export class ConfigService {
  private static instance: ConfigService;
  private config: { [key: string]: string | undefined };

  private constructor() {
    dotenv.config();
    this.config = {
      PORT: process.env.PORT || '3000',
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      API_PREFIX: process.env.API_PREFIX,
      NODE_ENV: process.env.NODE_ENV || 'development',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get(key: string): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Configuration key "${key}" is not defined`);
    }
    return value;
  }
}

export const config = ConfigService.getInstance();
