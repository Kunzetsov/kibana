/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { mapValues, pick } from 'lodash';
import { DatasourceSuggestion, TableChangeType } from '../types';
import { columnToOperation } from './indexpattern';
import { BaseIndexPatternColumn, isReferenced } from './operations';
import { IndexPatternLayer, IndexPatternPrivateState } from './types';

export function buildSuggestion({
  state,
  updatedLayer,
  layerId,
  label,
  changeType,
}: {
  state: IndexPatternPrivateState;
  layerId: string;
  changeType: TableChangeType;
  updatedLayer?: IndexPatternLayer;
  label?: string;
}): DatasourceSuggestion<IndexPatternPrivateState> {
  const updatedState = updatedLayer
    ? {
        ...state,
        layers: {
          ...state.layers,
          [layerId]: updatedLayer,
        },
      }
    : state;

  // It's fairly easy to accidentally introduce a mismatch between
  // columnOrder and columns, so this is a safeguard to ensure the
  // two match up.
  const layers = mapValues(updatedState.layers, (layer) => ({
    ...layer,
    columns: pick(layer.columns, layer.columnOrder) as Record<string, BaseIndexPatternColumn>,
  }));

  const columnOrder = layers[layerId].columnOrder;
  const columnMap = layers[layerId].columns as Record<string, BaseIndexPatternColumn>;
  const isMultiRow = Object.values(columnMap).some((column) => column.isBucketed);

  return {
    state: {
      ...updatedState,
      layers,
    },

    table: {
      columns: columnOrder
        // Hide any referenced columns from what visualizations know about
        .filter((columnId) => !isReferenced(layers[layerId]!, columnId))
        .map((columnId) => ({
          columnId,
          operation: columnToOperation(columnMap[columnId]),
        })),
      isMultiRow,
      layerId,
      changeType,
      label,
    },

    keptLayerIds: Object.keys(state.layers),
  };
}
