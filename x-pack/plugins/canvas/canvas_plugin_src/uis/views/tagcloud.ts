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
      displayName: strings.getScaleColumnDisplayName(),
      help: strings.getScaleColumnHelp(),
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
    {
      name: 'orientation',
      displayName: strings.getOrientationColumnDisplayName(),
      help: strings.getOrientationColumnHelp(),
      argType: 'select',
      default: 'single',
      options: {
        choices: [
          { value: 'single', name: strings.getOrientationSingle() },
          { value: 'right angled', name: strings.getOrientationRightAngled() },
          { value: 'multiple', name: strings.getOrientationMultiple() },
        ],
      },
    },
    {
      name: 'minFontSize',
      displayName: strings.getMinFontHeightColumnDisplayName(),
      help: strings.getMinFontHeightColumnHelp(),
      argType: 'number',
      default: 18,
    },
    {
      name: 'maxFontSize',
      displayName: strings.getMaxFontHeightColumnDisplayName(),
      help: strings.getMaxFontHeightColumnHelp(),
      argType: 'number',
      default: 72,
    },
    {
      name: 'showLabel',
      displayName: strings.getShowLabelColumnDisplayName(),
      help: strings.getShowLabelColumnHelp(),
      argType: 'toggle',
      default: true,
    },
    {
      name: 'palette',
      argType: 'palette',
    },
  ],
});
