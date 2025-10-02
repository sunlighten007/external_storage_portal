// Runtime configuration for AWS Amplify
// This handles loading configuration at runtime from Amplify's secret management

let runtimeConfig: any = null;

export async function loadRuntimeConfig() {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  try {
    // In AWS Amplify, secrets are available as environment variables at runtime
    // but they might not be available during build time
    runtimeConfig = {
      DATABASE_URL: process.env.DATABASE_URL,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_REGION: process.env.S3_REGION || 'us-east-1',
      S3_BUCKET: process.env.S3_BUCKET,
      AUTH_SECRET: process.env.AUTH_SECRET,
      USE_LOCAL_S3: process.env.USE_LOCAL_S3 === 'true',
    };

    // Debug logging
    console.log('🔍 Runtime Configuration Loaded:');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Available secrets:', Object.keys(runtimeConfig).filter(key => runtimeConfig[key]));
    console.log('Missing secrets:', Object.keys(runtimeConfig).filter(key => !runtimeConfig[key]));

    return runtimeConfig;
  } catch (error) {
    console.error('Error loading runtime configuration:', error);
    throw error;
  }
}

export function getRuntimeConfig() {
  if (!runtimeConfig) {
    throw new Error('Runtime configuration not loaded. Call loadRuntimeConfig() first.');
  }
  return runtimeConfig;
}
