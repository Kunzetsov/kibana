/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSplitPanel, EuiText } from '@elastic/eui';

export const formHoc = (Form: React.FC) => (props: any) => {
  return (
    <EuiSplitPanel.Outer grow={false} hasBorder={true}>
      <EuiSplitPanel.Inner paddingSize="s">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText size="s">{props.expr.name}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              iconType="cross"
              aria-label="Delete"
              onClick={() => props.onValueRemove()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiSplitPanel.Inner>
      <EuiSplitPanel.Inner grow={false} color="subdued">
        <Form {...props} />
      </EuiSplitPanel.Inner>
    </EuiSplitPanel.Outer>
  );
};
