import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

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

const setAuthorizationHeader = async (value) => {
  try {
    await kvs.set('authorizationHeader', value);
  } catch (error) {
    console.log('kvs.set failed:', error?.message);
  }

  try {
    if (typeof kvs.setSecret === 'function') {
      await kvs.setSecret('authorizationHeader', value);
    }
  } catch (error) {
    console.log('kvs.setSecret failed:', error?.message);
  }
};

resolver.define('getSettings', async () => {
  const urlTemplate = await kvs.get('urlTemplate');
  const hasAuthorizationHeader = !!(await getAuthorizationHeader());
  return { urlTemplate: urlTemplate || '', hasAuthorizationHeader };
});

resolver.define('saveSettings', async ({ payload }) => {
  const { urlTemplate, authorizationHeader } = payload;
  await kvs.set('urlTemplate', urlTemplate);
  if (authorizationHeader) {
    await setAuthorizationHeader(authorizationHeader);
  }
  return { success: true };
});

export const handler = resolver.getDefinitions();
