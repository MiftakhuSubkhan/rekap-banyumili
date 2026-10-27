/**
 * googleSheetsClient.js - Google Sheets Webhook Integration
 */

const GS_CONFIG_KEY = 'banyumili_gsheets_url';

export function getGoogleSheetsUrl() {
  try {
    return localStorage.getItem(GS_CONFIG_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function saveGoogleSheetsUrl(url) {
  if (!url) {
    localStorage.removeItem(GS_CONFIG_KEY);
    return;
  }
  const cleanUrl = url.trim();
  localStorage.setItem(GS_CONFIG_KEY, cleanUrl);
}

export function isGoogleSheetsConnected() {
  const url = getGoogleSheetsUrl();
  return Boolean(url && url.startsWith('https://script.google.com/'));
}

/**
 * Fetch all transactions from Google Sheets via GET
 */
export async function fetchTransactionsFromSheets() {
  const url = getGoogleSheetsUrl();
  if (!url) return { success: false, message: 'URL Google Sheets belum diatur' };

  try {
    // Add cache busting query
    const res = await fetch(`${url}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('Fetch from Google Sheets failed:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Send action to Google Sheets via POST
 * Using 'text/plain' Content-Type avoids CORS preflight OPTIONS issues with Google Apps Script
 */
export async function sendToGoogleSheets(action, payload) {
  const url = getGoogleSheetsUrl();
  if (!url) return { success: false, message: 'URL Google Sheets belum diatur' };

  try {
    const bodyData = {
      action: action,
      data: payload,
      id: payload && payload.id ? payload.id : undefined
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(bodyData)
    });

    try {
      const json = await res.json();
      return json;
    } catch {
      // Sometimes Google redirects, but POST succeeded
      return { success: true, message: 'Terkirim ke Google Sheets' };
    }
  } catch (err) {
    console.warn('Google Sheets POST notification error:', err);
    return { success: false, message: err.message };
  }
}
