import browser from 'webextension-polyfill';

// Basecamp OAuth configuration
const AUTH_CONFIG = {
  clientId: 'e88231ae820315fbfcd20f9d68a2723aaf9c261c',
  authUrl: 'https://launchpad.37signals.com/authorization/new',
  tokenUrl: 'https://launchpad.37signals.com/authorization/token',
  redirectUrl: browser.identity.getRedirectURL(),
  scope: '',
};

// Storage keys
const STORAGE_KEYS = {
  accessToken: 'basecamp_access_token',
  refreshToken: 'basecamp_refresh_token',
  expiresAt: 'basecamp_token_expires_at',
  userInfo: 'basecamp_user_info',
};

/**
 * Initiates the Basecamp OAuth flow
 */
export async function authorize() {
  try {
    // Construct the authorization URL
    const authUrl = new URL(AUTH_CONFIG.authUrl);
    authUrl.searchParams.append('type', 'web_server');
    authUrl.searchParams.append('client_id', AUTH_CONFIG.clientId);
    authUrl.searchParams.append('redirect_uri', AUTH_CONFIG.redirectUrl);
    
    // Launch the auth flow
    const redirectUrl = await browser.identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });
    
    // Extract the authorization code from the redirect URL
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw new Error('Authorization code not found in the redirect URL');
    }
    
    // Exchange the code for an access token
    return await getAccessToken(code);
  } catch (error) {
    console.error('Authorization failed:', error);
    throw error;
  }
}

/**
 * Exchanges the authorization code for an access token
 */
async function getAccessToken(code: string) {
  try {
    // Prepare the token request
    const tokenRequest = {
      type: 'web_server',
      client_id: AUTH_CONFIG.clientId,
      client_secret: 'ad9d03e6a0b7101efeb9c09117c1d4c70f28d73e', // Replace with your actual client secret
      code,
      redirect_uri: AUTH_CONFIG.redirectUrl,
    };
    
    // Make the token request
    const response = await fetch(AUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenRequest),
    });
    
    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    
    // Calculate token expiration time (Basecamp tokens typically last 2 weeks)
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Store the tokens
    await browser.storage.local.set({
      [STORAGE_KEYS.accessToken]: tokenData.access_token,
      [STORAGE_KEYS.refreshToken]: tokenData.refresh_token,
      [STORAGE_KEYS.expiresAt]: expiresAt,
    });
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshAccessToken() {
  try {
    const { basecamp_refresh_token } = await browser.storage.local.get(STORAGE_KEYS.refreshToken);
    
    if (!basecamp_refresh_token) {
      throw new Error('No refresh token available');
    }
    
    // Prepare the refresh token request
    const refreshRequest = {
      type: 'refresh',
      client_id: AUTH_CONFIG.clientId,
      client_secret: 'ad9d03e6a0b7101efeb9c09117c1d4c70f28d73e', // Replace with your actual client secret
      refresh_token: basecamp_refresh_token,
    };
    
    // Make the refresh token request
    const response = await fetch(AUTH_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refreshRequest),
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }
    
    const tokenData = await response.json();
    
    // Calculate token expiration time
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    // Store the new tokens
    await browser.storage.local.set({
      [STORAGE_KEYS.accessToken]: tokenData.access_token,
      [STORAGE_KEYS.refreshToken]: tokenData.refresh_token,
      [STORAGE_KEYS.expiresAt]: expiresAt,
    });
    
    return tokenData.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

/**
 * Gets the current access token, refreshing if necessary
 */
export async function getToken() {
  try {
    const { basecamp_access_token, basecamp_token_expires_at } = await browser.storage.local.get(
      [STORAGE_KEYS.accessToken, STORAGE_KEYS.expiresAt]
    );
    
    // If token exists and is not expired, return it
    if (basecamp_access_token && basecamp_token_expires_at && Date.now() < basecamp_token_expires_at) {
      return basecamp_access_token;
    }
    
    // Otherwise, refresh the token
    return await refreshAccessToken();
  } catch (error) {
    console.error('Failed to get token:', error);
    throw error;
  }
}

/**
 * Checks if the user is authenticated
 */
export async function isAuthenticated() {
  try {
    const { basecamp_access_token } = await browser.storage.local.get(STORAGE_KEYS.accessToken);
    return !!basecamp_access_token;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * Logs the user out by clearing stored tokens
 */
export async function logout() {
  try {
    await browser.storage.local.remove([
      STORAGE_KEYS.accessToken,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.expiresAt,
      STORAGE_KEYS.userInfo,
    ]);
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
}

/**
 * Makes an authenticated API request to Basecamp
 */
export async function fetchFromBasecamp(url: string, options: RequestInit = {}) {
  try {
    const token = await getToken();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Basecamp AI Assistant (waqarahmadweb@gmail.com)',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}