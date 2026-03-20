import { fetch } from '@forge/api';
import { kvs } from '@forge/kvs';

const getAuthorizationHeader = async () => {
  try {
    const value = await kvs.get('authorizationHeader');
    if (value) {
      return value;
    }
  } catch (error) {
    console.log('kvs.get failed:', error?.message);
  }

  try {
    if (typeof kvs.getSecret === 'function') {
      return await kvs.getSecret('authorizationHeader');
    }
  } catch (error) {
    console.log('kvs.getSecret failed:', error?.message);
  }

  return undefined;
};

export async function fetchExternalData(payload) {
  const { parameter1, parameter2 } = payload;

  const urlTemplate = await kvs.get('urlTemplate');
  if (!urlTemplate) {
    throw new Error(
      'URL is not configured. Ask your Jira administrator to configure the Fetch External Data action settings.'
    );
  }

  const url = urlTemplate
    .replace('{parameter1}', encodeURIComponent(parameter1 ?? ''))
    .replace('{parameter2}', encodeURIComponent(parameter2 ?? ''));

  const headers = { Accept: 'application/json' };

  const authorizationHeader = await getAuthorizationHeader();
  if (authorizationHeader) {
    headers['Authorization'] = authorizationHeader;
  }

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    throw new Error(`External API call failed: HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('fetchExternalData result:', JSON.stringify(data));

  return {
    outputs: {
      accountId: data.lead.accountId, 
      statusCode: response.status,
      requestUrl: url,
    }
  };
}
