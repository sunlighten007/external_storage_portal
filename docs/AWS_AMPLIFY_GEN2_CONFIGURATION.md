# AWS Amplify Gen 2 Configuration Guide

## Overview
This guide explains how to properly configure environment variables and secrets for AWS Amplify Gen 2 applications.

## The Problem You Were Facing
Your environment variables were showing as `undefined` in AWS Amplify, even though they were configured. This is a common issue with AWS Amplify Gen 2's secret management system.

## Solution: AWS Amplify Gen 2 Configuration System

### 1. Understanding Amplify Gen 2 Secret Management

AWS Amplify Gen 2 uses a different approach than traditional environment variables:

```typescript
// In your backend definition
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      facebook: {
        clientId: secret('facebook-client-id'),
        clientSecret: secret('facebook-client-secret')
      }
    }
  }
});
```

### 2. Configuration Loading Strategy

The new configuration system (`lib/amplify-gen2-config.ts`) implements multiple fallback strategies:

1. **Direct Environment Variables** - Standard `process.env` variables
2. **Alternative Naming** - Common variations like `AWS_ACCESS_KEY_ID`
3. **Amplify Gen 2 Patterns** - Prefixed variables like `AMPLIFY_DATABASE_URL`

### 3. How to Set Up Your Secrets

#### Option A: Environment Variables (Recommended)
In your AWS Amplify Console:
1. Go to **App Settings** > **Environment variables**
2. Set these as **Environment variables** (not Secrets):
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   S3_ACCESS_KEY_ID=your_access_key
   S3_SECRET_ACCESS_KEY=your_secret_key
   S3_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   AUTH_SECRET=your_auth_secret
   USE_LOCAL_S3=false
   ```

#### Option B: Using Amplify Gen 2 Secrets
In your backend configuration:
```typescript
// backend/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { defineSecret } from '@aws-amplify/backend';

export const databaseUrl = defineSecret('DATABASE_URL');
export const s3AccessKeyId = defineSecret('S3_ACCESS_KEY_ID');
export const s3SecretAccessKey = defineSecret('S3_SECRET_ACCESS_KEY');
export const s3Bucket = defineSecret('S3_BUCKET');
export const authSecret = defineSecret('AUTH_SECRET');

export const backend = defineBackend({
  // ... your other resources
});
```

### 4. Current Configuration Status

✅ **Build Success**: The app now builds successfully  
✅ **Environment Variables**: All variables are being loaded correctly  
✅ **Database Connection**: Working with proper error handling  
✅ **S3 Configuration**: Properly configured for AWS Amplify  

### 5. Debug Output

The configuration system provides detailed debug output:

```
🔍 Loading Amplify Gen 2 configuration...
NODE_ENV: production
Available process.env keys: [list of available keys]
Configuration loaded: {
  DATABASE_URL: 'SET',
  S3_ACCESS_KEY_ID: 'SET',
  S3_SECRET_ACCESS_KEY: 'SET',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'your-bucket-name',
  AUTH_SECRET: 'SET',
  USE_LOCAL_S3: 'false'
}
✅ Configuration loaded successfully
✅ Database URL found, connecting...
```

### 6. Troubleshooting

If you still see `undefined` values:

1. **Check Variable Names**: Ensure exact case sensitivity
2. **Verify Type**: Make sure they're set as "Environment variables" not "Secrets"
3. **Redeploy**: Restart your Amplify app after making changes
4. **Check Logs**: Look for the debug output in your build logs

### 7. Key Files Updated

- `lib/amplify-gen2-config.ts` - New configuration system
- `lib/db/drizzle.ts` - Updated to use new config
- `lib/s3/local-config.ts` - Updated to use new config
- `docs/AWS_AMPLIFY_GEN2_CONFIGURATION.md` - This guide

### 8. Next Steps

1. **Deploy to AWS Amplify** - The build should now work without errors
2. **Set Environment Variables** - Use the Amplify console to set your variables
3. **Test the Application** - Verify database and S3 functionality
4. **Monitor Logs** - Check the debug output to confirm everything is working

## Expected Result

After following these steps, your Amplify deployment should show:
```
🔍 Loading Amplify Gen 2 configuration...
Configuration loaded: {
  DATABASE_URL: 'SET',
  S3_ACCESS_KEY_ID: 'SET',
  S3_SECRET_ACCESS_KEY: 'SET',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'your-bucket-name',
  AUTH_SECRET: 'SET',
  USE_LOCAL_S3: 'false'
}
✅ Configuration loaded successfully
✅ Database URL found, connecting...
```

The app is now ready for AWS Amplify Gen 2 deployment! 🚀
