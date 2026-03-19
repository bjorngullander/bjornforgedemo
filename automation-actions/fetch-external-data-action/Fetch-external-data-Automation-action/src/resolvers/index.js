import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getSettings', async () => {
  const urlTemplate = await storage.get('urlTemplate');
  const hasApiToken = !!(await storage.getSecret('apiToken'));
  return { urlTemplate: urlTemplate || '', hasApiToken };
});

resolver.define('saveSettings', async ({ payload }) => {
  const { urlTemplate, apiToken } = payload;
  await storage.set('urlTemplate', urlTemplate);
  if (apiToken) {
    await storage.setSecret('apiToken', apiToken);
  }
  return { success: true };
});

export const handler = resolver.getDefinitions();
