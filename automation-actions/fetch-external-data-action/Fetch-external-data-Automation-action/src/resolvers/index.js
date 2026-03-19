import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

const getAuthorizationHeader = async () => {
  try {
    return await kvs.getSecret('authorizationHeader');
  } catch (error) {
    console.log('kvs.getSecret failed, falling back to kvs.get:', error?.message);
    return await kvs.get('authorizationHeader');
  }
};

const setAuthorizationHeader = async (value) => {
  try {
    await kvs.setSecret('authorizationHeader', value);
  } catch (error) {
    console.log('kvs.setSecret failed, falling back to kvs.set:', error?.message);
    await kvs.set('authorizationHeader', value);
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
