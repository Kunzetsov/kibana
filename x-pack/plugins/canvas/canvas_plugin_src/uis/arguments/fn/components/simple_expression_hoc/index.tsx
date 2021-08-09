/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSplitPanel, EuiText } from '@elastic/eui';

export const simpleExpressionHoc = (ExpressionComponent: React.FC) => (props: any) => {
  return (
    <EuiFlexGroup gutterSize="s" direction="column">
      <EuiFlexItem>
        <ExpressionComponent onChange={props.onChange} value={props.value} id={props.argId} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
