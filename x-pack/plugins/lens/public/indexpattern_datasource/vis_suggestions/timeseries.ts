/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ConvertToLensVisTypes,
  TsvbTimeseriesToLensXyLayerContext,
} from '@kbn/visualizations-plugin/public';
import { generateId } from '../../id_generator';
import { IndexPatternSuggestion } from '../indexpattern_suggestions';
import {
  computeLayerFromContext,
  getSplitByFiltersLayer,
  getSplitByTermsLayer,
  insertNewColumn,
} from '../operations';
import { buildSuggestion } from '../suggestion';
import {
  IndexPattern,
  IndexPatternField,
  IndexPatternLayer,
  IndexPatternPrivateState,
} from '../types';

function createNewTimeseriesLayerWithMetricAggregationFromVizEditor(
  indexPattern: IndexPattern,
  layer: TsvbTimeseriesToLensXyLayerContext
): IndexPatternLayer | undefined {
  const { timeFieldName, splitMode, splitFilters, metrics, timeInterval, dropPartialBuckets } =
    layer;
  const dateField = indexPattern.getFieldByName(timeFieldName!);

  const splitFields = layer.splitFields
    ? (layer.splitFields
        .map((item) => indexPattern.getFieldByName(item))
        .filter(Boolean) as IndexPatternField[])
    : null;

  // generate the layer for split by terms
  if (splitMode === 'terms' && splitFields?.length) {
    return getSplitByTermsLayer(indexPattern, splitFields, dateField, layer);
    // generate the layer for split by filters
  } else if (splitMode?.includes('filter') && splitFilters && splitFilters.length) {
    return getSplitByFiltersLayer(indexPattern, dateField, layer);
  } else {
    const copyMetricsArray = [...metrics];
    const computedLayer = computeLayerFromContext(
      metrics.length === 1,
      copyMetricsArray,
      indexPattern,
      layer.format,
      layer.label
    );
    // static values layers do not need a date histogram column
    if (Object.values(computedLayer.columns)[0].isStaticValue) {
      return computedLayer;
    }

    return insertNewColumn({
      op: 'date_histogram',
      layer: computedLayer,
      columnId: generateId(),
      field: dateField,
      indexPattern,
      visualizationGroups: [],
      columnParams: {
        interval: timeInterval,
        dropPartials: dropPartialBuckets,
      },
    });
  }
}

export function convertTimeseries(
  state: IndexPatternPrivateState,
  layer: TsvbTimeseriesToLensXyLayerContext
): { layerId: string; suggestion: IndexPatternSuggestion } | undefined {
  const indexPattern = state.indexPatterns[layer.indexPatternId];
  const newId = generateId();
  let newLayer: IndexPatternLayer | undefined;
  if (indexPattern.timeFieldName) {
    newLayer = createNewTimeseriesLayerWithMetricAggregationFromVizEditor(indexPattern, layer);
  }
  if (!newLayer) {
    return;
  }

  const suggestion = buildSuggestion({
    state,
    updatedLayer: newLayer,
    layerId: newId,
    changeType: 'initial',
  });

  const layerId = Object.keys(suggestion.state.layers)[0];

  return { layerId, suggestion };
}

export const isTimeseriesContext = (
  layer: unknown
): layer is TsvbTimeseriesToLensXyLayerContext => {
  return (
    (layer as TsvbTimeseriesToLensXyLayerContext).fromVisType === ConvertToLensVisTypes.TIMESERIES
  );
};
