import browser from 'webextension-polyfill';
/**
 * Check if the user is logged in
 */
export async function checkLoginStatus() {
    try {
        const { basecamp_access_token } = await browser.storage.local.get('basecamp_access_token');
        return !!basecamp_access_token;
    } catch (error) {
        console.error('Authentication check failed:', error);
        return false;
    }
}