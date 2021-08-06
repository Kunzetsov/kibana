/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiAccordion,
  EuiButtonIcon,
  EuiDataGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { getId } from '../../../../../public/lib/get_id';

export const formHoc = (Form: React.FC) => (props: any) => {
  return (
    <EuiPanel hasBorder={true} paddingSize="s">
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText>{props.expr.name}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="cross"
            aria-label="Delete"
            onClick={() => props.onValueRemove()}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <Form {...props} />
    </EuiPanel>
  );
};
