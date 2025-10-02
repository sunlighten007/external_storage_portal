import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

// Microsoft 365 Configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
  },
};

const msalInstance = new ConfidentialClientApplication(msalConfig);

// Custom authentication provider for Microsoft Graph
class GraphAuthProvider implements AuthenticationProvider {
  private accessToken: string = '';

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      this.accessToken = response!.accessToken;
      return this.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw new Error('Failed to acquire access token');
    }
  }
}

// Initialize Microsoft Graph client
const graphClient = Client.initWithMiddleware({
  authProvider: new GraphAuthProvider(),
});

export interface MicrosoftUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
}

export interface MicrosoftTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<MicrosoftTokenResponse> {
  try {
    const tokenRequest = {
      code,
      scopes: ['User.Read'],
      redirectUri,
    };

    const response = await msalInstance.acquireTokenByCode(tokenRequest);
    
    return {
      access_token: response!.accessToken,
      token_type: 'Bearer',
      expires_in: response!.expiresOn ? Math.floor((response!.expiresOn.getTime() - Date.now()) / 1000) : 3600,
      scope: 'User.Read',
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

/**
 * Get user information from Microsoft Graph using access token
 */
export async function getMicrosoftUser(accessToken: string): Promise<MicrosoftUser> {
  try {
    const user = await graphClient
      .me
      .get({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    return {
      id: user.id!,
      displayName: user.displayName || '',
      mail: user.mail || user.userPrincipalName || '',
      userPrincipalName: user.userPrincipalName || '',
    };
  } catch (error) {
    console.error('Error getting Microsoft user:', error);
    throw new Error('Failed to get user information from Microsoft Graph');
  }
}

/**
 * Validate that the user's email domain is sunlighten.com
 */
export function validateDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === 'sunlighten.com';
}

/**
 * Generate Microsoft OAuth2 authorization URL
 */
export function getMicrosoftAuthUrl(redirectUri: string): string {
  const authUrlParameters = {
    scopes: ['User.Read'],
    redirectUri,
    prompt: 'select_account',
  };

  return msalInstance.getAuthCodeUrl(authUrlParameters);
}
