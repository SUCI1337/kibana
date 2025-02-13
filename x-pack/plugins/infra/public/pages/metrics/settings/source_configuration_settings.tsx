/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import React, { useCallback } from 'react';
import { Prompt, useEditableSettings } from '@kbn/observability-shared-plugin/public';
import {
  enableInfrastructureHostsView,
  enableInfrastructureProfilingIntegration,
} from '@kbn/observability-plugin/common';
import { SourceLoadingPage } from '../../../components/source_loading_page';
import { useSourceContext } from '../../../containers/metrics_source';
import { useInfraMLCapabilitiesContext } from '../../../containers/ml/infra_ml_capabilities';
import { IndicesConfigurationPanel } from './indices_configuration_panel';
import { MLConfigurationPanel } from './ml_configuration_panel';
import { NameConfigurationPanel } from './name_configuration_panel';
import { useSourceConfigurationFormState } from './source_configuration_form_state';
import { useMetricsBreadcrumbs } from '../../../hooks/use_metrics_breadcrumbs';
import { settingsTitle } from '../../../translations';

import { MetricsPageTemplate } from '../page_template';
import { FeaturesConfigurationPanel } from './features_configuration_panel';
interface SourceConfigurationSettingsProps {
  shouldAllowEdit: boolean;
}

export const SourceConfigurationSettings = ({
  shouldAllowEdit,
}: SourceConfigurationSettingsProps) => {
  useMetricsBreadcrumbs([
    {
      text: settingsTitle,
    },
  ]);

  const {
    createSourceConfiguration,
    source,
    sourceExists,
    isLoading,
    isUninitialized,
    updateSourceConfiguration,
  } = useSourceContext();

  const {
    indicesConfigurationProps,
    errors,
    resetForm,
    isFormDirty,
    isFormValid,
    formState,
    formStateChanges,
  } = useSourceConfigurationFormState(source && source.configuration);
  const infraUiSettings = useEditableSettings('infra_metrics', [
    enableInfrastructureHostsView,
    enableInfrastructureProfilingIntegration,
  ]);

  const resetAllUnsavedChanges = useCallback(() => {
    resetForm();
    infraUiSettings.cleanUnsavedChanges();
  }, [infraUiSettings, resetForm]);

  const persistUpdates = useCallback(async () => {
    await Promise.all([
      sourceExists
        ? updateSourceConfiguration(formStateChanges)
        : createSourceConfiguration(formState),
      infraUiSettings.saveAll(),
    ]);
    resetForm();
  }, [
    sourceExists,
    resetForm,
    updateSourceConfiguration,
    formStateChanges,
    infraUiSettings,
    createSourceConfiguration,
    formState,
  ]);

  const hasUnsavedChanges = isFormDirty || Object.keys(infraUiSettings.unsavedChanges).length > 0;

  const isWriteable = shouldAllowEdit && (!Boolean(source) || source?.origin !== 'internal');

  const { metricIndicesExist, remoteClustersExist } = source?.status ?? {};

  const { hasInfraMLCapabilities } = useInfraMLCapabilitiesContext();

  if ((isLoading || isUninitialized) && !source) {
    return <SourceLoadingPage />;
  }

  return (
    <MetricsPageTemplate
      pageHeader={{
        pageTitle: settingsTitle,
      }}
      data-test-subj="sourceConfigurationContent"
      restrictWidth
    >
      <Prompt
        prompt={
          isFormDirty
            ? i18n.translate('xpack.infra.sourceConfiguration.unsavedFormPrompt', {
                defaultMessage: 'Are you sure you want to leave? Changes will be lost',
              })
            : undefined
        }
      />
      <EuiPanel paddingSize="l" hasShadow={false} hasBorder={true}>
        <NameConfigurationPanel
          isLoading={isLoading}
          nameFieldProps={indicesConfigurationProps.name}
          readOnly={!isWriteable}
        />
      </EuiPanel>
      <EuiSpacer />
      <EuiPanel paddingSize="l" hasShadow={false} hasBorder={true}>
        <IndicesConfigurationPanel
          isLoading={isLoading}
          metricAliasFieldProps={indicesConfigurationProps.metricAlias}
          readOnly={!isWriteable}
          metricIndicesExist={metricIndicesExist}
          remoteClustersExist={remoteClustersExist}
        />
      </EuiPanel>
      <EuiSpacer />
      {hasInfraMLCapabilities && (
        <>
          <EuiPanel paddingSize="l" hasShadow={false} hasBorder={true}>
            <MLConfigurationPanel
              isLoading={isLoading}
              readOnly={!isWriteable}
              anomalyThresholdFieldProps={indicesConfigurationProps.anomalyThreshold}
            />
          </EuiPanel>
          <EuiSpacer />
        </>
      )}
      <EuiPanel paddingSize="l" hasShadow={false} hasBorder={true}>
        <FeaturesConfigurationPanel readOnly={!isWriteable} {...infraUiSettings} />
      </EuiPanel>
      <EuiSpacer />
      {errors.length > 0 ? (
        <>
          <EuiCallOut color="danger">
            <ul>
              {errors.map((error, errorIndex) => (
                <li key={errorIndex}>{error}</li>
              ))}
            </ul>
          </EuiCallOut>
          <EuiSpacer size="m" />
        </>
      ) : null}
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        {isWriteable && (
          <EuiFlexItem>
            {isLoading || infraUiSettings.isSaving ? (
              <EuiFlexGroup justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButton
                    data-test-subj="infraSourceConfigurationSettingsLoadingButton"
                    color="primary"
                    isLoading
                    fill
                  >
                    {i18n.translate('xpack.infra.sourceConfiguration.loadingButtonLabel', {
                      defaultMessage: 'Loading',
                    })}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            ) : (
              <>
                <EuiFlexGroup justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      data-test-subj="discardSettingsButton"
                      color="danger"
                      iconType="cross"
                      isDisabled={!hasUnsavedChanges}
                      onClick={resetAllUnsavedChanges}
                    >
                      <FormattedMessage
                        id="xpack.infra.sourceConfiguration.discardSettingsButtonLabel"
                        defaultMessage="Discard"
                      />
                    </EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      data-test-subj="applySettingsButton"
                      color="primary"
                      isDisabled={!hasUnsavedChanges || !isFormValid}
                      fill
                      onClick={persistUpdates}
                    >
                      <FormattedMessage
                        id="xpack.infra.sourceConfiguration.applySettingsButtonLabel"
                        defaultMessage="Apply"
                      />
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </>
            )}
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </MetricsPageTemplate>
  );
};
