import { S3Client } from '@aws-sdk/client-s3';

// Local S3 configuration for testing
export const createLocalS3Client = () => {
  return new S3Client({
    region: 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    forcePathStyle: true, // Required for LocalStack
  });
};

// Production S3 configuration
export const createProductionS3Client = () => {
  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
};

// Choose client based on environment
export const createS3Client = () => {
  if (process.env.NODE_ENV === 'test' || process.env.USE_LOCAL_S3 === 'true') {
    return createLocalS3Client();
  }
  return createProductionS3Client();
};
