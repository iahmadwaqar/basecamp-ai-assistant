import browser from 'webextension-polyfill';
import { getToken, isAuthenticated } from '../utils/auth/basecampAuth';

console.log('background script loaded');

// Listen for messages from popup or content scripts
browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
  if (message.action === 'checkAuth') {
    return await isAuthenticated();
  }
  
  if (message.action === 'getToken') {
    return await getToken();
  }
  
  return false;
});