/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  EuiButton,
  EuiPageTemplate,
  EuiEmptyPrompt,
  EuiComboBox,
  EuiInlineEditTitle,
  EuiFormRow,
  EuiSpacer,
  EuiComboBoxOptionOption,
  EuiButtonEmpty,
} from '@elastic/eui';
import React, { ChangeEvent, FunctionComponent } from 'react';
import { FormikProvider, useFormik, Field, Form } from 'formik';

import {
  MOCK_IDP_SECURITY_ROLE_NAMES,
  MOCK_IDP_OBSERVABILITY_ROLE_NAMES,
  MOCK_IDP_SEARCH_ROLE_NAMES,
} from '@kbn/mock-idp-utils/src/constants';
import { useAuthenticator } from './role_switcher';

export interface LoginPageProps {
  projectType?: string;
}

export const LoginPage: FunctionComponent<LoginPageProps> = ({ projectType }) => {
  const roles =
    projectType === 'security'
      ? MOCK_IDP_SECURITY_ROLE_NAMES
      : projectType === 'observability'
      ? MOCK_IDP_OBSERVABILITY_ROLE_NAMES
      : MOCK_IDP_SEARCH_ROLE_NAMES;

  const [, switchCurrentUser] = useAuthenticator(true);
  const formik = useFormik({
    initialValues: {
      full_name: 'Test User',
      role: roles[0],
    },
    async onSubmit(values) {
      await switchCurrentUser({
        username: sanitizeUsername(values.full_name),
        full_name: values.full_name,
        email: sanitizeEmail(values.full_name),
        roles: [values.role],
      });
    },
  });

  return (
    <FormikProvider value={formik}>
      <EuiPageTemplate panelled={false}>
        <EuiPageTemplate.Section alignment="center">
          <Form>
            <EuiEmptyPrompt
              iconType="user"
              layout="vertical"
              color="plain"
              body={
                <>
                  <Field
                    as={EuiInlineEditTitle}
                    name="full_name"
                    heading="h2"
                    inputAriaLabel="Edit name inline"
                    value={formik.values.full_name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue('full_name', event.target.value);
                    }}
                    onCancel={(previousValue: string) => {
                      formik.setFieldValue('full_name', previousValue);
                    }}
                    isReadOnly={formik.isSubmitting}
                    editModeProps={{
                      formRowProps: {
                        error: formik.errors.full_name,
                      },
                    }}
                    validate={(value: string) => {
                      if (value.trim().length === 0) {
                        return 'Name cannot be empty';
                      }
                    }}
                    isInvalid={!!formik.errors.full_name}
                    placeholder="Enter your name"
                    css={{ width: 350 }}
                  />
                  <EuiSpacer size="m" />

                  <EuiFormRow error={formik.errors.role} isInvalid={!!formik.errors.role}>
                    <Field
                      as={EuiComboBox}
                      name="role"
                      placeholder="Select your role"
                      singleSelection={{ asPlainText: true }}
                      options={roles.map((role) => ({ label: role }))}
                      selectedOptions={
                        formik.values.role ? [{ label: formik.values.role }] : undefined
                      }
                      onCreateOption={(value: string) => {
                        formik.setFieldValue('role', value);
                      }}
                      onChange={(selectedOptions: EuiComboBoxOptionOption[]) => {
                        formik.setFieldValue(
                          'role',
                          selectedOptions.length === 0 ? '' : selectedOptions[0].label
                        );
                      }}
                      validate={(value: string) => {
                        if (value.trim().length === 0) {
                          return 'Role cannot be empty';
                        }
                      }}
                      isInvalid={!!formik.errors.role}
                      isClearable={false}
                      fullWidth
                    />
                  </EuiFormRow>
                </>
              }
              actions={[
                <EuiButton
                  type="submit"
                  disabled={!formik.isValid}
                  isLoading={formik.isSubmitting}
                  fill
                >
                  Log in
                </EuiButton>,
                <EuiButtonEmpty size="xs" href="/">
                  More login options
                </EuiButtonEmpty>,
              ]}
            />
          </Form>
        </EuiPageTemplate.Section>
      </EuiPageTemplate>
    </FormikProvider>
  );
};

const sanitizeUsername = (username: string) =>
  username.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
const sanitizeEmail = (email: string) => `${sanitizeUsername(email)}@elastic.co`;
