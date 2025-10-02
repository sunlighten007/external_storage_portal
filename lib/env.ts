// Environment variable utilities for AWS Amplify
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug function to log environment variables in production
export function debugEnvironmentVariables() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Environment Variables Debug (Production)');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Available environment variables:');
    
    const relevantVars = Object.keys(process.env)
      .filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('S3_') ||
        key.includes('AUTH_') ||
        key.includes('NEXTAUTH_') ||
        key.includes('AZURE_') ||
        key.includes('USE_LOCAL_S3')
      )
      .sort();
    
    relevantVars.forEach(key => {
      const value = process.env[key];
      // Mask sensitive values
      const maskedValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')
        ? value ? `${value.substring(0, 4)}...` : 'undefined'
        : value || 'undefined';
      console.log(`  ${key}: ${maskedValue}`);
    });
    
    console.log('Total environment variables:', Object.keys(process.env).length);
  }
}

// Get database URL with fallbacks
export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL || 
                     process.env.POSTGRES_URL || 
                     process.env.POSTGRES_CONNECTION_STRING ||
                     process.env.DATABASE_CONNECTION_STRING;

  if (!databaseUrl) {
    console.error('❌ Database URL not found!');
    console.error('Available environment variables:', Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB')
    ));
    throw new Error('Database URL environment variable is not set. Expected one of: DATABASE_URL, POSTGRES_URL, POSTGRES_CONNECTION_STRING, or DATABASE_CONNECTION_STRING');
  }

  return databaseUrl;
}

// Get S3 configuration
export function getS3Config() {
  return {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET,
    useLocalS3: process.env.USE_LOCAL_S3 === 'true'
  };
}
