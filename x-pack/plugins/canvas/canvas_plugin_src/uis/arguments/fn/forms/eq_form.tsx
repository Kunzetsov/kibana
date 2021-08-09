/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiSelect } from '@elastic/eui';
import React, { useState, useEffect, useCallback } from 'react';
import { formHoc, simpleExpressionHoc } from '../components';

export const EqFormInput = (props: any = {}) => (
  <EuiFieldText
    compressed
    value={''}
    placeholder='e.g. "50/elastic"'
    onChange={() => {}}
    {...props}
  />
);

export const EqFormComponent = simpleExpressionHoc(EqFormInput);

export const EqForm = formHoc(EqFormComponent);
