import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

resolver.define('getSettings', async () => {
  const urlTemplate = await kvs.get('urlTemplate');
  console.log('getSettings urlTemplate:', urlTemplate);
  const hasAuthorizationHeader = !!(await kvs.getSecret('authorizationHeader'));
  return { urlTemplate: urlTemplate || '', hasAuthorizationHeader };
});

resolver.define('saveSettings', async ({ payload }) => {
  const { urlTemplate, authorizationHeader } = payload;
  await kvs.set('urlTemplate', urlTemplate);
  if (authorizationHeader) {
    await kvs.setSecret('authorizationHeader', authorizationHeader);
  }
  return { success: true };
});

export const handler = resolver.getDefinitions();
