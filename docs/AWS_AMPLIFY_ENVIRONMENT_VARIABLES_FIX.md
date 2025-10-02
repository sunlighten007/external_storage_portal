# AWS Amplify Environment Variables Fix

## Problem
Environment variables are not being loaded at runtime in AWS Amplify, showing:
```
Available process.env variables: []
Config values: {
  DATABASE_URL: 'NOT SET',
  S3_ACCESS_KEY_ID: 'NOT SET',
  // ... all variables are NOT SET
}
```

## Root Cause
AWS Amplify has two different systems for managing configuration:
1. **Environment Variables** - Available as `process.env` variables
2. **Secrets** - Need to be accessed through AWS services (Parameter Store, Secrets Manager)

## Solution

### Step 1: Check Your Amplify Configuration

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Go to **App Settings** > **Environment variables**

2. **Verify Variable Type**
   - Make sure your variables are set as **"Environment variables"** (not "Secrets")
   - Environment variables are automatically available as `process.env.VARIABLE_NAME`
   - Secrets require additional AWS SDK calls

### Step 2: Set Environment Variables Correctly

In your Amplify console, set these as **Environment Variables**:

```
DATABASE_URL=postgresql://username:password@host:port/database
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
AUTH_SECRET=your_auth_secret
USE_LOCAL_S3=false
```

### Step 3: Alternative - Use AWS Systems Manager Parameter Store

If you need to use secrets (for security), you can store them in Parameter Store:

1. **Create Parameters in AWS Systems Manager**
   - Go to AWS Systems Manager > Parameter Store
   - Create parameters with these names:
     - `/amplify/DATABASE_URL`
     - `/amplify/S3_ACCESS_KEY_ID`
     - `/amplify/S3_SECRET_ACCESS_KEY`
     - `/amplify/S3_REGION`
     - `/amplify/S3_BUCKET`
     - `/amplify/AUTH_SECRET`
     - `/amplify/USE_LOCAL_S3`

2. **Update IAM Permissions**
   - Add these permissions to your Amplify service role:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:GetParameter",
           "ssm:GetParameters",
           "ssm:GetParametersByPath"
         ],
         "Resource": "arn:aws:ssm:*:*:parameter/amplify/*"
       }
     ]
   }
   ```

### Step 4: Test the Configuration

1. **Deploy your changes**
2. **Check the build logs** - you should see:
   ```
   🔍 Amplify Secrets Debug:
   NODE_ENV: production
   All process.env keys: [list of keys]
   Relevant process.env variables: [your variables]
   Loaded secrets: {
     DATABASE_URL: 'SET',
     S3_ACCESS_KEY_ID: 'SET',
     // ... all should be SET
   }
   ```

### Step 5: Troubleshooting

If variables are still not loading:

1. **Check Variable Names**
   - Ensure exact case sensitivity
   - No extra spaces or special characters

2. **Check Amplify Build Logs**
   - Look for any errors during the build process
   - Check if the variables are being set correctly

3. **Verify IAM Permissions**
   - Make sure Amplify has permission to access Parameter Store (if using secrets)

4. **Test Locally First**
   - Set the same variables in your local `.env.local` file
   - Run `npm run build:prod` to test locally

## Expected Result

After following these steps, your Amplify deployment should show:
```
🔍 Amplify Secrets Debug:
NODE_ENV: production
All process.env keys: [list including your variables]
Relevant process.env variables: [your variables]
Loaded secrets: {
  DATABASE_URL: 'SET',
  S3_ACCESS_KEY_ID: 'SET',
  S3_SECRET_ACCESS_KEY: 'SET',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'your-bucket-name',
  AUTH_SECRET: 'SET',
  USE_LOCAL_S3: 'false'
}
✅ Database URL found, connecting...
```

## Additional Notes

- **Environment Variables** are the recommended approach for non-sensitive configuration
- **Secrets** should be used for sensitive data like API keys and passwords
- The current implementation will work with both approaches
- Make sure to restart your Amplify app after making changes to environment variables
