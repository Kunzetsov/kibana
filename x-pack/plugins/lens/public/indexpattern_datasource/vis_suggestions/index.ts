/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { BaseLayerContext } from '@kbn/visualizations-plugin/public';
import { IndexPatternSuggestion } from '../indexpattern_suggestions';
import { IndexPatternPrivateState } from '../types';
import { isTimeseriesContext, convertTimeseries } from './timeseries';

const convertLayerToSuggestion = (state: IndexPatternPrivateState, layer: BaseLayerContext) => {
  if (isTimeseriesContext(layer)) {
    return convertTimeseries(state, layer);
  }
};

export function getVisSuggestions(
  state: IndexPatternPrivateState,
  context: BaseLayerContext[]
): IndexPatternSuggestion[] {
  const suggestions: IndexPatternSuggestion[] = [];
  for (let layerIdx = 0; layerIdx < context.length; layerIdx++) {
    const layer = context[layerIdx];
    const indexPattern = state.indexPatterns[layer.indexPatternId];
    if (!indexPattern) return [];

    const convertionContext = convertLayerToSuggestion(state, layer);
    if (convertionContext) {
      context[layerIdx].layerId = convertionContext.layerId;
      suggestions.push(convertionContext.suggestion);
    }
  }
  return suggestions;
}
