/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiSelect } from '@elastic/eui';
import React, { useState, useEffect, useCallback } from 'react';
import { DatatableColumn } from 'src/plugins/expressions';
import { formHoc } from '../components';

export const GetCellFormComponent = ({
  argValue,
  typeInstance,
  onValueChange,
  argId,
  columns,
}: {
  // @todo define types
  [key: string]: any;
}) => {
  const columnsOptions = [
    { value: '', text: 'select column', disabled: true },
    ...columns.map((column: DatatableColumn) => ({ value: column.name, text: column.name })),
  ];
  return (
    <EuiFlexGroup gutterSize="s" id={argId} direction="column">
      <EuiFlexItem>
        <EuiSelect
          compressed
          options={columnsOptions}
          value={''}
          // onChange={(ev) => console.log(ev)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const GetCellForm = formHoc(GetCellFormComponent);
