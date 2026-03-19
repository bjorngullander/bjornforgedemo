import React, { useEffect, useState } from 'react';

import { invoke } from '@forge/bridge';
import ForgeReconciler, {
  Form,
  useForm,
  Stack,
  Text,
  Textfield,
  Button,
  SectionMessage,
  Box,
  ErrorMessage,
} from '@forge/react';

const SettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const [hasApiToken, setHasApiToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { register, handleSubmit, reset, formState } = useForm();

  useEffect(() => {
    invoke('getSettings')
      .then(({ urlTemplate, hasApiToken: tokenSet }) => {
        reset({ urlTemplate, apiToken: '' });
        setHasApiToken(tokenSet);
        setLoading(false);
      })
      .catch(() => {
        setSaveError('Failed to load settings.');
        setLoading(false);
      });
  }, []);

  const onSubmit = async (data) => {
    setSaved(false);
    setSaveError(null);
    try {
      await invoke('saveSettings', {
        urlTemplate: data.urlTemplate,
        apiToken: data.apiToken || undefined,
      });
      setSaved(true);
      setHasApiToken(hasApiToken || !!data.apiToken);
      reset({ urlTemplate: data.urlTemplate, apiToken: '' });
    } catch {
      setSaveError('Failed to save settings. Please try again.');
    }
  };

  if (loading) {
    return <Text>Loading settings...</Text>;
  }

  const { onChange: urlOnChange, ...urlRegisterProps } = register('urlTemplate', {
    required: { value: true, message: 'URL is required' },
  });

  const { onChange: tokenOnChange, ...tokenRegisterProps } = register('apiToken');

  return (
    <Box padding="space.400">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack space="space.300">
          <Text weight="bold">Fetch External Data – Admin Settings</Text>
          <Text>
            Configure the URL and authentication for the Fetch External Data automation action.
            Use {'{parameter1}'} and {'{parameter2}'} as placeholders in the URL.
          </Text>

          <Stack space="space.100">
            <Text>URL Template</Text>
            <Textfield
              {...urlRegisterProps}
              onChange={(e) => { urlOnChange(e); }}
              placeholder="https://api.example.com/{parameter1}?id={parameter2}"
            />
            {formState.errors.urlTemplate?.message && (
              <ErrorMessage>{formState.errors.urlTemplate?.message}</ErrorMessage>
            )}
          </Stack>

          <Stack space="space.100">
            <Text>API Token</Text>
            {hasApiToken && (
              <Text>An API token is currently configured. Enter a new value below to replace it.</Text>
            )}
            <Textfield
              {...tokenRegisterProps}
              onChange={(e) => { tokenOnChange(e); }}
              placeholder={hasApiToken ? 'Leave blank to keep the existing token' : 'Enter API token'}
              type="password"
            />
            <Text>The token is stored securely and will be sent as a Bearer token in the Authorization header.</Text>
          </Stack>

          {saved && (
            <SectionMessage appearance="success" title="Settings saved successfully." />
          )}
          {saveError && (
            <SectionMessage appearance="error" title={saveError} />
          )}

          <Button type="submit" appearance="primary">Save Settings</Button>
        </Stack>
      </Form>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <SettingsForm />
  </React.StrictMode>
);
