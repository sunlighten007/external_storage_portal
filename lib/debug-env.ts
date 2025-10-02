// Debug utility to help troubleshoot environment variables in AWS Amplify
export function debugEnvironmentVariables() {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Environment Variables Debug (Production)');
    console.log('Available environment variables:');
    
    const relevantVars = Object.keys(process.env)
      .filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('S3_') ||
        key.includes('AUTH_') ||
        key.includes('NEXTAUTH_') ||
        key.includes('AZURE_')
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
