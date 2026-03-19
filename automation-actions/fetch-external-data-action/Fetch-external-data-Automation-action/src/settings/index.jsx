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
  const [hasAuthorizationHeader, setHasAuthorizationHeader] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { register, handleSubmit, reset, formState } = useForm();

  useEffect(() => {
    invoke('getSettings')
      .then(({ urlTemplate, hasAuthorizationHeader: headerSet }) => {
        reset({ urlTemplate, authorizationHeader: '' });
        setHasAuthorizationHeader(headerSet);
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
        authorizationHeader: data.authorizationHeader || undefined,
      });
      setSaved(true);
      setHasAuthorizationHeader(hasAuthorizationHeader || !!data.authorizationHeader);
      reset({ urlTemplate: data.urlTemplate, authorizationHeader: '' });
    } catch (error) {
      setSaveError('Failed to save settings. Please try again.' + error.message);
    }
  };

  if (loading) {
    return <Text>Loading settings...</Text>;
  }

  const { onChange: urlOnChange, ...urlRegisterProps } = register('urlTemplate', {
    required: { value: true, message: 'URL is required' },
  });

  const { onChange: authOnChange, ...authRegisterProps } = register('authorizationHeader');

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
            <Text>URL Template updated</Text>
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
            <Text>Authorization Header</Text>
            {hasAuthorizationHeader && (
              <Text>An authorization header is currently configured. Enter a new value below to replace it.</Text>
            )}
            <Textfield
              {...authRegisterProps}
              onChange={(e) => { authOnChange(e); }}
              placeholder={hasAuthorizationHeader ? 'Leave blank to keep the existing value' : 'e.g. Bearer mytoken  or  Basic dXNlcjpwYXNz'}
              type="password"
            />
            <Text>Enter the full Authorization header value. It will be sent verbatim, e.g. "Bearer &lt;token&gt;" or "Basic &lt;base64credentials&gt;".</Text>
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
