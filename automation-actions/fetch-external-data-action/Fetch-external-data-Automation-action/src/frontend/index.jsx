import React, { useEffect, useState } from 'react';

import { view, events } from '@forge/bridge';
import ForgeReconciler, {
  Form,
  useForm,
  Stack,
  Text,
  useProductContext,
  ErrorMessage,
  Textfield,
  Box,
} from '@forge/react';

const FetchDataForm = ({ context, isValidating }) => {
  const formInstance = useForm({
    defaultValues: context.extension.data.inputs,
    disabled: isValidating,
  });
  const { handleSubmit, register, getValues, formState } = formInstance;

  const onChange = (input) => {
    const updatedFormData = { ...getValues(), ...input };
    view.submit(updatedFormData);
  };

  const onSubmit = (data) => {
    view.submit(data);
  };

  const { onChange: param1OnChange, ...param1RegisterProps } = register('parameter1', {
    required: { value: true, message: 'Parameter 1 is required' },
    disabled: isValidating,
  });

  const { onChange: param2OnChange, ...param2RegisterProps } = register('parameter2', {
    required: { value: true, message: 'Parameter 2 is required' },
    disabled: isValidating,
  });

  return (
    <Box>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack space="space.100">
          <Text>Parameter 1</Text>
          <Textfield
            {...param1RegisterProps}
            onChange={(e) => {
              param1OnChange(e);
              onChange({ parameter1: e.target.value });
            }}
          />
          {formState.errors.parameter1?.message && (
            <ErrorMessage>{formState.errors.parameter1?.message}</ErrorMessage>
          )}
          <Text>Parameter 2</Text>
          <Textfield
            {...param2RegisterProps}
            onChange={(e) => {
              param2OnChange(e);
              onChange({ parameter2: e.target.value });
            }}
          />
          {formState.errors.parameter2?.message && (
            <ErrorMessage>{formState.errors.parameter2?.message}</ErrorMessage>
          )}
        </Stack>
      </Form>
    </Box>
  );
};

export const App = () => {
  const context = useProductContext();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const handleValidateRuleEvent = ({ isValidating }) => {
      setIsValidating(isValidating);
    };
    const subscription = events.on('AUTOMATION_ACTION_VALIDATE_RULE_EVENT', handleValidateRuleEvent);
    return () => subscription.then((sub) => sub.unsubscribe());
  }, []);

  return context
    ? <FetchDataForm context={context} isValidating={isValidating} />
    : <Text>Loading...</Text>;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
