import React, { useEffect, useState } from 'react';

import { invoke } from '@forge/bridge';
import ForgeReconciler, {
  Form,
  Stack,
  Text,
  Textfield,
  Button,
  SectionMessage,
  Box,
} from '@forge/react';

const SettingsForm = () => {
  const [loading, setLoading] = useState(true);
  const [hasAuthorizationHeader, setHasAuthorizationHeader] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [urlTemplate, setUrlTemplate] = useState('');
  const [authorizationHeader, setAuthorizationHeader] = useState('');

  useEffect(() => {
    invoke('getSettings')
      .then(({ urlTemplate, hasAuthorizationHeader: headerSet }) => {
        setUrlTemplate(urlTemplate || '');
        setAuthorizationHeader('');
        setHasAuthorizationHeader(headerSet);
        setLoading(false);
      })
      .catch((error) => {
        setSaveError('Failed to load settings. ' + error.message);
        setLoading(false);
      });
  }, []);

  const onSubmit = async () => {
    setSaved(false);
    setSaveError(null);

    if (!urlTemplate?.trim()) {
      setSaveError('URL is required');
      return;
    }

    try {
      await invoke('saveSettings', {
        urlTemplate: urlTemplate.trim(),
        authorizationHeader: authorizationHeader || undefined,
      });
      setSaved(true);
      setHasAuthorizationHeader(hasAuthorizationHeader || !!authorizationHeader);
      setAuthorizationHeader('');
    } catch (error) {
      setSaveError('Failed to save settings. Please try again. ' + error.message);
    }
  };

  if (loading) {
    return <Text>Loading settings...</Text>;
  }

  return (
    <Box padding="space.400">
      <Form onSubmit={onSubmit}>
        <Stack space="space.300">
          <Text weight="bold">Fetch External Data – Admin Settings</Text>
          <Text>
            Configure the URL and authentication for the Fetch External Data automation action.
            Use {'{parameter1}'} and {'{parameter2}'} as placeholders in the URL.
          </Text>

          <Stack space="space.100">
            <Text>URL Template</Text>
            <Textfield
              value={urlTemplate}
              onChange={(e) => setUrlTemplate(e.target.value)}
              placeholder="https://api.example.com/{parameter1}?id={parameter2}"
            />
          </Stack>

          <Stack space="space.100">
            <Text>Authorization Header</Text>
            {hasAuthorizationHeader && (
              <Text>An authorization header is currently configured. Enter a new value below to replace it.</Text>
            )}
            <Textfield
              value={authorizationHeader}
              onChange={(e) => setAuthorizationHeader(e.target.value)}
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
