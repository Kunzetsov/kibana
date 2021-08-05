/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { get } from 'lodash';
import { DatatableColumn } from 'src/plugins/expressions';
import { getState, getValue } from '../../../public/lib/resolved_arg';
import { ModelStrings } from '../../../i18n';

const { Math: strings } = ModelStrings;

export const ply = () => ({
  name: 'ply',
  displayName: 'Ply',
  args: [
    {
      name: 'by',
      displayName: 'By',
      help: 'By help',
      argType: 'select',
    },
  ],
  resolve({ context }: any) {
    if (getState(context) !== 'ready') {
      return { columns: [] };
    }
    const columns = get(getValue(context), 'columns', []);
    return {
      choises: columns.map(({ id, name }: DatatableColumn) => ({ value: id, name })),
      columns,
    };
  },
});
