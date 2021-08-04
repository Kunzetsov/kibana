/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ViewStrings } from '../../../i18n';

const { Tagcloud: strings } = ViewStrings;

export const tagcloud = () => ({
  name: 'tagcloud',
  displayName: strings.getDisplayName(),
  modelArgs: [],
  args: [
    {
      name: 'scale',
      displayName: strings.getColumnDisplayName(),
      help: strings.getColumnHelp(),
      argType: 'select',
      default: 'linear',
      options: {
        choices: [
          { value: 'linear', name: strings.getScaleLinear() },
          { value: 'log', name: strings.getScaleLog() },
          { value: 'square root', name: strings.getScaleSquareRoot() },
        ],
      },
    },
  ],
});
