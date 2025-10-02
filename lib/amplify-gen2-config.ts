// AWS Amplify Gen 2 Configuration
// This handles secret management using the official Amplify Gen 2 approach

interface AmplifyConfig {
  DATABASE_URL: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_REGION: string;
  S3_BUCKET: string;
  AUTH_SECRET: string;
  USE_LOCAL_S3: boolean;
}

let cachedConfig: AmplifyConfig | null = null;

// Load configuration with multiple fallback strategies
function loadConfig(): AmplifyConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  console.log('🔍 Loading Amplify Gen 2 configuration...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Available process.env keys:', Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('S3_') || key.includes('AUTH_') || key.includes('AWS_')
  ));

  // Strategy 1: Direct environment variables (most common in Amplify Gen 2)
  const config: Partial<AmplifyConfig> = {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION || 'us-east-1',
    S3_BUCKET: process.env.S3_BUCKET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    USE_LOCAL_S3: process.env.USE_LOCAL_S3 === 'true',
  };

  // Strategy 2: Alternative naming conventions
  if (!config.DATABASE_URL) {
    config.DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_CONNECTION_STRING;
  }
  if (!config.S3_ACCESS_KEY_ID) {
    config.S3_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  }
  if (!config.S3_SECRET_ACCESS_KEY) {
    config.S3_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  }
  if (!config.S3_BUCKET) {
    config.S3_BUCKET = process.env.AWS_S3_BUCKET;
  }

  // Strategy 3: Check for Amplify Gen 2 secret environment variables
  // In Amplify Gen 2, secrets are often prefixed or available in specific ways
  if (!config.DATABASE_URL) {
    // Try common Amplify Gen 2 secret patterns
    config.DATABASE_URL = process.env.AMPLIFY_DATABASE_URL || 
                         process.env.AMPLIFY_SECRET_DATABASE_URL ||
                         process.env.DATABASE_CONNECTION_STRING ||
                         process.env.POSTGRES_CONNECTION_STRING;
  }

  if (!config.S3_ACCESS_KEY_ID) {
    config.S3_ACCESS_KEY_ID = process.env.AMPLIFY_S3_ACCESS_KEY_ID || 
                              process.env.AMPLIFY_SECRET_S3_ACCESS_KEY_ID;
  }

  if (!config.S3_SECRET_ACCESS_KEY) {
    config.S3_SECRET_ACCESS_KEY = process.env.AMPLIFY_S3_SECRET_ACCESS_KEY || 
                                  process.env.AMPLIFY_SECRET_S3_SECRET_ACCESS_KEY;
  }

  if (!config.S3_BUCKET) {
    config.S3_BUCKET = process.env.AMPLIFY_S3_BUCKET || 
                       process.env.AMPLIFY_SECRET_S3_BUCKET;
  }

  if (!config.AUTH_SECRET) {
    config.AUTH_SECRET = process.env.AMPLIFY_AUTH_SECRET || 
                         process.env.AMPLIFY_SECRET_AUTH_SECRET;
  }

  // Strategy 4: Try AWS Lambda environment variables (for Amplify hosting)
  if (!config.DATABASE_URL) {
    config.DATABASE_URL = process.env.DATABASE_CONNECTION_STRING ||
                         process.env.POSTGRES_URL;
  }

  // Strategy 5: Check if we're in AWS Lambda environment and try different patterns
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('🔍 Running in AWS Lambda environment, trying additional patterns...');
    
    // Try to access from AWS Systems Manager Parameter Store
    if (!config.DATABASE_URL || !config.S3_ACCESS_KEY_ID) {
      console.log('🔍 Attempting to load from AWS Systems Manager Parameter Store...');
      // This would require AWS SDK, but we'll log the attempt
      console.log('Note: AWS SDK access would be needed for Parameter Store integration');
    }
  }

  // Debug logging
  console.log('Configuration loaded:', {
    DATABASE_URL: config.DATABASE_URL ? 'SET' : 'NOT SET',
    S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    S3_REGION: config.S3_REGION || 'NOT SET',
    S3_BUCKET: config.S3_BUCKET || 'NOT SET',
    AUTH_SECRET: config.AUTH_SECRET ? 'SET' : 'NOT SET',
    USE_LOCAL_S3: config.USE_LOCAL_S3 ? 'true' : 'false',
  });

  // Validate required configuration
  const requiredFields: (keyof AmplifyConfig)[] = ['DATABASE_URL', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET', 'AUTH_SECRET'];
  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    console.error('❌ Missing required configuration fields:', missingFields);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🔧 AWS Amplify Gen 2 Configuration Troubleshooting:');
      console.error('1. Check your Amplify backend configuration');
      console.error('2. Ensure secrets are properly defined using secret() function');
      console.error('3. Verify environment variables are set in Amplify console');
      console.error('4. Check if you need to use defineSecret() in your backend');
      console.error('5. Make sure your frontend has access to the secrets');
    }

    throw new Error(`Missing required configuration: ${missingFields.join(', ')}`);
  }

  cachedConfig = config as AmplifyConfig;
  console.log('✅ Configuration loaded successfully');
  return cachedConfig;
}

// Export functions for accessing configuration
export function getDatabaseUrl(): string {
  const config = loadConfig();
  return config.DATABASE_URL;
}

export function getS3Config() {
  const config = loadConfig();
  return {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION,
    bucket: config.S3_BUCKET,
    useLocalS3: config.USE_LOCAL_S3
  };
}

export function getAuthSecret(): string {
  const config = loadConfig();
  return config.AUTH_SECRET;
}

export function getAllConfig(): AmplifyConfig {
  return loadConfig();
}
