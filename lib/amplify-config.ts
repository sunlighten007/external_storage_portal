// AWS Amplify configuration utilities
// This handles both regular environment variables and Amplify secrets

interface AmplifyConfig {
  DATABASE_URL?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_REGION?: string;
  S3_BUCKET?: string;
  AUTH_SECRET?: string;
  USE_LOCAL_S3?: string;
}

// Function to get configuration from multiple sources
export function getAmplifyConfig(): AmplifyConfig {
  // In AWS Amplify, secrets are available as environment variables at runtime
  const config: AmplifyConfig = {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    USE_LOCAL_S3: process.env.USE_LOCAL_S3,
  };

  // Debug logging
  console.log('🔍 Amplify Configuration Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Available process.env variables:', Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('S3_') || key.includes('AUTH_')
  ));
  console.log('Config values:', {
    DATABASE_URL: config.DATABASE_URL ? 'SET' : 'NOT SET',
    S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    S3_REGION: config.S3_REGION || 'NOT SET',
    S3_BUCKET: config.S3_BUCKET || 'NOT SET',
    AUTH_SECRET: config.AUTH_SECRET ? 'SET' : 'NOT SET',
    USE_LOCAL_S3: config.USE_LOCAL_S3 || 'NOT SET',
  });

  return config;
}

// Get database URL with proper error handling
export function getDatabaseUrl(): string {
  const config = getAmplifyConfig();
  
  if (!config.DATABASE_URL) {
    console.error('❌ Database URL not found in Amplify configuration!');
    console.error('Available config keys:', Object.keys(config));
    console.error('Full config:', config);
    throw new Error('Database URL not found. Please check your Amplify secret management configuration.');
  }

  return config.DATABASE_URL;
}

// Get S3 configuration
export function getS3Config() {
  const config = getAmplifyConfig();
  
  return {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION || 'us-east-1',
    bucket: config.S3_BUCKET,
    useLocalS3: config.USE_LOCAL_S3 === 'true'
  };
}

// Get auth secret
export function getAuthSecret(): string {
  const config = getAmplifyConfig();
  
  if (!config.AUTH_SECRET) {
    throw new Error('AUTH_SECRET not found. Please check your Amplify secret management configuration.');
  }

  return config.AUTH_SECRET;
}
