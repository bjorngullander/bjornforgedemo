import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

resolver.define('getSettings', async () => {
  const urlTemplate = await kvs.get('urlTemplate');
  const hasApiToken = !!(await kvs.getSecret('apiToken'));
  return { urlTemplate: urlTemplate || '', hasApiToken };
});

resolver.define('saveSettings', async ({ payload }) => {
  const { urlTemplate, apiToken } = payload;
  await kvs.set('urlTemplate', urlTemplate);
  if (apiToken) {
    await kvs.setSecret('apiToken', apiToken);
  }
  return { success: true };
});

export const handler = resolver.getDefinitions();
