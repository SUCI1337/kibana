/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act } from '@testing-library/react';
import { noop } from 'lodash';

import { coreMock, scopedHistoryMock, themeServiceMock } from '@kbn/core/public/mocks';
import { featuresPluginMock } from '@kbn/features-plugin/public/mocks';
import type { Unmount } from '@kbn/management-plugin/public/types';

import { rolesManagementApp } from './roles_management_app';
import { licenseMock } from '../../../common/licensing/index.mock';

jest.mock('./roles_grid', () => ({
  RolesGridPage: (props: any) => `Roles Page: ${JSON.stringify(props)}`,
}));

jest.mock('./edit_role', () => ({
  // `docLinks` object is too big to include into test snapshot, so we just check its existence.
  EditRolePage: (props: any) =>
    `Role Edit Page: ${JSON.stringify({ ...props, docLinks: props.docLinks ? {} : undefined })}`,
}));

async function mountApp(basePath: string, pathname: string) {
  const { fatalErrors } = coreMock.createSetup();
  const container = document.createElement('div');
  const setBreadcrumbs = jest.fn();

  const featuresStart = featuresPluginMock.createStart();
  const coreStart = coreMock.createStart();
  coreStart.application.capabilities = {
    ...coreStart.application.capabilities,
    roles: {
      save: true,
    },
  };

  let unmount: Unmount = noop;
  await act(async () => {
    unmount = await rolesManagementApp
      .create({
        license: licenseMock.create(),
        fatalErrors,
        getStartServices: jest
          .fn()
          .mockResolvedValue([coreStart, { data: {}, features: featuresStart }]),
      })
      .mount({
        basePath,
        element: container,
        setBreadcrumbs,
        history: scopedHistoryMock.create({ pathname }),
        theme$: themeServiceMock.createTheme$(),
      });
  });

  return { unmount, container, setBreadcrumbs, docTitle: coreStart.chrome.docTitle };
}

describe('rolesManagementApp', () => {
  it('create() returns proper management app descriptor', () => {
    const { fatalErrors, getStartServices } = coreMock.createSetup();

    expect(
      rolesManagementApp.create({
        license: licenseMock.create(),
        fatalErrors,
        getStartServices: getStartServices as any,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "id": "roles",
        "mount": [Function],
        "order": 20,
        "title": "Roles",
      }
    `);
  });

  it('mount() works for the `grid` page', async () => {
    const { setBreadcrumbs, container, unmount, docTitle } = await mountApp('/', '/');

    expect(setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(setBreadcrumbs).toHaveBeenCalledWith([{ text: 'Roles' }]);
    expect(docTitle.change).toHaveBeenCalledWith('Roles');
    expect(docTitle.reset).not.toHaveBeenCalled();
    expect(container).toMatchInlineSnapshot(`
      <div>
        Roles Page: {"notifications":{"toasts":{}},"rolesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"history":{"action":"PUSH","length":1,"location":{"pathname":"/","search":"","hash":""}},"readOnly":false}
      </div>
    `);

    act(() => {
      unmount();
    });

    expect(docTitle.reset).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  it('mount() works for the `create role` page', async () => {
    const { setBreadcrumbs, container, unmount, docTitle } = await mountApp('/', '/edit');

    expect(setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(setBreadcrumbs).toHaveBeenCalledWith([{ href: `/`, text: 'Roles' }, { text: 'Create' }]);
    expect(docTitle.change).toHaveBeenCalledWith('Roles');
    expect(docTitle.reset).not.toHaveBeenCalled();
    expect(container).toMatchInlineSnapshot(`
      <div>
        Role Edit Page: {"action":"edit","rolesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"userAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"indicesAPIClient":{"fieldCache":{},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"privilegesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}},"notifications":{"toasts":{}},"fatalErrors":{},"license":{"features$":{}},"docLinks":{},"uiCapabilities":{"catalogue":{},"management":{},"navLinks":{},"roles":{"save":true}},"history":{"action":"PUSH","length":1,"location":{"pathname":"/edit","search":"","hash":""}}}
      </div>
    `);

    act(() => {
      unmount();
    });

    expect(docTitle.reset).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  it('mount() works for the `edit role` page', async () => {
    const roleName = 'role@name';

    const { setBreadcrumbs, container, unmount, docTitle } = await mountApp(
      '/',
      `/edit/${roleName}`
    );

    expect(setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(setBreadcrumbs).toHaveBeenCalledWith([{ href: `/`, text: 'Roles' }, { text: roleName }]);
    expect(docTitle.change).toHaveBeenCalledWith('Roles');
    expect(docTitle.reset).not.toHaveBeenCalled();
    expect(container).toMatchInlineSnapshot(`
      <div>
        Role Edit Page: {"action":"edit","roleName":"role@name","rolesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"userAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"indicesAPIClient":{"fieldCache":{},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"privilegesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}},"notifications":{"toasts":{}},"fatalErrors":{},"license":{"features$":{}},"docLinks":{},"uiCapabilities":{"catalogue":{},"management":{},"navLinks":{},"roles":{"save":true}},"history":{"action":"PUSH","length":1,"location":{"pathname":"/edit/role@name","search":"","hash":""}}}
      </div>
    `);

    act(() => {
      unmount();
    });

    expect(docTitle.reset).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  it('mount() works for the `clone role` page', async () => {
    const roleName = 'someRoleName';

    const { setBreadcrumbs, container, unmount, docTitle } = await mountApp(
      '/',
      `/clone/${roleName}`
    );

    expect(setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(setBreadcrumbs).toHaveBeenCalledWith([{ href: `/`, text: 'Roles' }, { text: 'Create' }]);
    expect(docTitle.change).toHaveBeenCalledWith('Roles');
    expect(docTitle.reset).not.toHaveBeenCalled();
    expect(container).toMatchInlineSnapshot(`
      <div>
        Role Edit Page: {"action":"clone","roleName":"someRoleName","rolesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"userAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"indicesAPIClient":{"fieldCache":{},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"privilegesAPIClient":{"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}}},"http":{"basePath":{"basePath":"","serverBasePath":"","assetsHrefBase":""},"anonymousPaths":{},"externalUrl":{},"staticAssets":{}},"notifications":{"toasts":{}},"fatalErrors":{},"license":{"features$":{}},"docLinks":{},"uiCapabilities":{"catalogue":{},"management":{},"navLinks":{},"roles":{"save":true}},"history":{"action":"PUSH","length":1,"location":{"pathname":"/clone/someRoleName","search":"","hash":""}}}
      </div>
    `);

    act(() => {
      unmount();
    });

    expect(docTitle.reset).toHaveBeenCalledTimes(1);

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  it('mount() properly encodes role name in `edit role` page link in breadcrumbs', async () => {
    const roleName = 'some 安全性 role';

    const { setBreadcrumbs } = await mountApp('/', `/edit/${roleName}`);

    expect(setBreadcrumbs).toHaveBeenCalledTimes(1);
    expect(setBreadcrumbs).toHaveBeenCalledWith([
      { href: `/`, text: 'Roles' },
      {
        text: roleName,
      },
    ]);
  });
});
