/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { get } from 'lodash';

import { ViewStrings } from '../../../i18n';
import { getState, getValue } from '../../../public/lib/resolved_arg';

const { Heatmap: strings } = ViewStrings;

export const heatmap = () => ({
  name: 'heatmap',
  displayName: strings.getDisplayName(),
  args: [
    {
      name: 'xAccessor',
      displayName: strings.getXAccessorDisplayName(),
      help: strings.getXAccessorHelp(),
      argType: 'vis_dimension',
      default: `{visdimension}`,
    },
    {
      name: 'yAccessor',
      displayName: strings.getYAccessorDisplayName(),
      help: strings.getYAccessorHelp(),
      argType: 'vis_dimension',
      default: `{visdimension}`,
    },
    {
      name: 'valueAccessor',
      displayName: strings.getValueAccessorDisplayName(),
      help: strings.getValueAccessorHelp(),
      argType: 'vis_dimension',
      default: `{visdimension}`,
    },
    {
      name: 'palette',
      argType: 'stops_palette',
    },
    {
      name: 'legend',
      displayName: strings.getLegendDisplayName(),
      help: strings.getLegendHelp(),
      type: 'model',
      argType: 'heatmap_legend',
    },
    {
      name: 'gridConfig',
      displayName: strings.getGridConfigDisplayName(),
      help: strings.getGridConfigHelp(),
      type: 'model',
      argType: 'heatmap_grid',
    },
  ],
  resolve({ context }: any) {
    if (getState(context) !== 'ready') {
      return { columns: [] };
    }
    return { columns: get(getValue(context), 'columns', []) };
  },
});
