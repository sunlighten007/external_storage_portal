// AWS Amplify Fallback Configuration
// This provides fallback values when environment variables are not available

interface FallbackConfig {
  DATABASE_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_REGION: string;
  S3_BUCKET: string;
  AUTH_SECRET: string;
  USE_LOCAL_S3: boolean;
}

// Fallback configuration for development/testing
const FALLBACK_CONFIG: FallbackConfig = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres',
  S3_ACCESS_KEY_ID: 'fallback-access-key',
  S3_SECRET_ACCESS_KEY: 'fallback-secret-key',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'fallback-bucket',
  AUTH_SECRET: 'fallback-auth-secret',
  USE_LOCAL_S3: true,
};

// Check if we're in a development environment
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' ||
         process.env.AMPLIFY_ENV === 'dev';
}

// Get configuration with fallbacks
export function getFallbackConfig(): FallbackConfig {
  console.log('🔍 Loading fallback configuration...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('AMPLIFY_ENV:', process.env.AMPLIFY_ENV);
  console.log('AWS_LAMBDA_FUNCTION_NAME:', process.env.AWS_LAMBDA_FUNCTION_NAME);

  // Try to get from environment variables first
  const config: Partial<FallbackConfig> = {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION || 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    USE_LOCAL_S3: process.env.USE_LOCAL_S3 === 'true',
  };

  // Always use fallback values for missing configuration - never throw errors
  const finalConfig: FallbackConfig = {
    DATABASE_URL: config.DATABASE_URL || FALLBACK_CONFIG.DATABASE_URL,
    S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID || FALLBACK_CONFIG.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY || FALLBACK_CONFIG.S3_SECRET_ACCESS_KEY,
    S3_REGION: config.S3_REGION || FALLBACK_CONFIG.S3_REGION,
    S3_BUCKET: config.S3_BUCKET || FALLBACK_CONFIG.S3_BUCKET,
    AUTH_SECRET: config.AUTH_SECRET || FALLBACK_CONFIG.AUTH_SECRET,
    USE_LOCAL_S3: config.USE_LOCAL_S3 ?? FALLBACK_CONFIG.USE_LOCAL_S3,
  };

  // Log which values are using fallbacks
  const usingFallbacks = [];
  if (!config.DATABASE_URL) usingFallbacks.push('DATABASE_URL');
  if (!config.S3_ACCESS_KEY_ID) usingFallbacks.push('S3_ACCESS_KEY_ID');
  if (!config.S3_SECRET_ACCESS_KEY) usingFallbacks.push('S3_SECRET_ACCESS_KEY');
  if (!config.S3_BUCKET) usingFallbacks.push('S3_BUCKET');
  if (!config.AUTH_SECRET) usingFallbacks.push('AUTH_SECRET');

  if (usingFallbacks.length > 0) {
    console.log('⚠️ Using fallback values for:', usingFallbacks.join(', '));
    console.log('This indicates AWS Amplify environment variables are not properly configured');
    console.log('Please check your Amplify console: App Settings > Environment variables');
  }

  console.log('Configuration loaded:', {
    DATABASE_URL: finalConfig.DATABASE_URL ? 'SET' : 'NOT SET',
    S3_ACCESS_KEY_ID: finalConfig.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    S3_SECRET_ACCESS_KEY: finalConfig.S3_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    S3_REGION: finalConfig.S3_REGION || 'NOT SET',
    S3_BUCKET: finalConfig.S3_BUCKET || 'NOT SET',
    AUTH_SECRET: finalConfig.AUTH_SECRET ? 'SET' : 'NOT SET',
    USE_LOCAL_S3: finalConfig.USE_LOCAL_S3 ? 'true' : 'false',
  });

  return finalConfig;
}

// Export individual getters
export function getDatabaseUrl(): string {
  return getFallbackConfig().DATABASE_URL;
}

export function getS3Config() {
  const config = getFallbackConfig();
  return {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION,
    bucket: config.S3_BUCKET,
    useLocalS3: config.USE_LOCAL_S3
  };
}

export function getAuthSecret(): string {
  return getFallbackConfig().AUTH_SECRET;
}
