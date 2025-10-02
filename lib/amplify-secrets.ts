// AWS Amplify Secret Management Integration
// This handles accessing secrets from AWS Amplify's secret management system

interface AmplifySecrets {
  DATABASE_URL?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_REGION?: string;
  S3_BUCKET?: string;
  AUTH_SECRET?: string;
  USE_LOCAL_S3?: string;
}

// Function to load secrets from AWS Amplify
function loadAmplifySecrets(): AmplifySecrets {
  // Debug logging first
  console.log('🔍 Amplify Secrets Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('All process.env keys:', Object.keys(process.env).sort());
  console.log('Relevant process.env variables:', Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('S3_') || key.includes('AUTH_') || key.includes('AWS_')
  ));

  // Try to get from process.env
  const secrets: AmplifySecrets = {
    DATABASE_URL: process.env.DATABASE_URL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    USE_LOCAL_S3: process.env.USE_LOCAL_S3,
  };

  // Also try alternative naming conventions
  if (!secrets.DATABASE_URL) {
    secrets.DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_CONNECTION_STRING;
  }
  if (!secrets.S3_ACCESS_KEY_ID) {
    secrets.S3_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  }
  if (!secrets.S3_SECRET_ACCESS_KEY) {
    secrets.S3_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  }
  if (!secrets.S3_REGION) {
    secrets.S3_REGION = process.env.AWS_REGION;
  }
  if (!secrets.S3_BUCKET) {
    secrets.S3_BUCKET = process.env.AWS_S3_BUCKET;
  }

  // If still no secrets found, try to load from AWS Systems Manager Parameter Store
  if (!secrets.DATABASE_URL && process.env.NODE_ENV === 'production') {
    console.log('🔍 No secrets found in process.env, this might be an Amplify secret management issue.');
    console.log('Please check your Amplify console:');
    console.log('1. Go to App Settings > Environment variables');
    console.log('2. Make sure your variables are set as "Environment variables" not "Secrets"');
    console.log('3. Or use AWS Systems Manager Parameter Store for secrets');
  }

  console.log('Loaded secrets:', {
    DATABASE_URL: secrets.DATABASE_URL ? 'SET' : 'NOT SET',
    S3_ACCESS_KEY_ID: secrets.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET',
    S3_SECRET_ACCESS_KEY: secrets.S3_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
    S3_REGION: secrets.S3_REGION || 'NOT SET',
    S3_BUCKET: secrets.S3_BUCKET || 'NOT SET',
    AUTH_SECRET: secrets.AUTH_SECRET ? 'SET' : 'NOT SET',
    USE_LOCAL_S3: secrets.USE_LOCAL_S3 || 'NOT SET',
  });

  return secrets;
}

// Get database URL with proper error handling
export function getDatabaseUrl(): string {
  const secrets = loadAmplifySecrets();
  
  if (!secrets.DATABASE_URL) {
    console.error('❌ Database URL not found in Amplify secrets!');
    console.error('Available secrets keys:', Object.keys(secrets));
    console.error('Full secrets:', secrets);
    throw new Error('Database URL not found. Please check your Amplify secret management configuration.');
  }

  return secrets.DATABASE_URL;
}

// Get S3 configuration
export function getS3Config() {
  const secrets = loadAmplifySecrets();
  
  return {
    accessKeyId: secrets.S3_ACCESS_KEY_ID,
    secretAccessKey: secrets.S3_SECRET_ACCESS_KEY,
    region: secrets.S3_REGION || 'us-east-1',
    bucket: secrets.S3_BUCKET,
    useLocalS3: secrets.USE_LOCAL_S3 === 'true'
  };
}

// Get auth secret
export function getAuthSecret(): string {
  const secrets = loadAmplifySecrets();
  
  if (!secrets.AUTH_SECRET) {
    throw new Error('AUTH_SECRET not found. Please check your Amplify secret management configuration.');
  }

  return secrets.AUTH_SECRET;
}

// Get all secrets
export function getAllSecrets(): AmplifySecrets {
  return loadAmplifySecrets();
}
