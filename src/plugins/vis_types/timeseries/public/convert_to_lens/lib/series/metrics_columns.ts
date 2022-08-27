/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DataView } from '@kbn/data-views-plugin/common';
import type { Metric, Series } from '../../../../common/types';
import { getSeriesAgg } from './series_agg';
import { SUPPORTED_METRICS } from '../metrics';
import {
  Column,
  convertMetricsToColumns,
  convertToPercentileColumns,
  convertToPercentileRankColumns,
  convertMathToFormulaColumn,
  convertParentPipelineAggToColumns,
  convertToCumulativeSumColumns,
  convertOtherAggsToFormulaColumn,
  convertFilterRatioToFormulaColumn,
  convertToLastValueColumn,
  convertToStaticValueColumn,
  convertMetricAggregationColumnWithoutSpecialParams,
  convertToCounterRateFormulaColumn,
  convertToStandartDeviationColumn,
} from '../convert';
import { getValidColumns } from './columns';

export const getMetricsColumns = (
  series: Series,
  dataView: DataView,
  visibleSeriesCount: number,
  window?: string
): Column[] | null => {
  const { metrics: validMetrics, seriesAgg } = getSeriesAgg(
    series.metrics as [Metric, ...Metric[]]
  );

  if (!validMetrics.length) {
    return null;
  }
  const metrics = validMetrics as [Metric, ...Metric[]];
  // series agg supported as collapseFn if we have split
  if (seriesAgg && series.split_mode === 'everything') {
    return null;
  }
  const metricIdx = metrics.length - 1;
  const aggregation = metrics[metricIdx].type;
  const aggregationMap = SUPPORTED_METRICS[aggregation];
  if (!aggregationMap) {
    return null;
  }

  const columnsConverterArgs = { series, metrics, dataView };
  switch (aggregation) {
    case 'percentile': {
      const percentileColumns = convertMetricsToColumns(
        columnsConverterArgs,
        convertToPercentileColumns,
        window
      );
      return getValidColumns(percentileColumns);
    }
    case 'percentile_rank': {
      const percentileRankColumns = convertMetricsToColumns(
        columnsConverterArgs,
        convertToPercentileRankColumns,
        window
      );
      return getValidColumns(percentileRankColumns);
    }
    case 'math': {
      const formulaColumn = convertMathToFormulaColumn(columnsConverterArgs, window);
      return getValidColumns(formulaColumn);
    }
    case 'derivative':
    case 'moving_average': {
      const movingAverageOrDerivativeColumns = convertParentPipelineAggToColumns(
        columnsConverterArgs,
        window
      );
      return getValidColumns(movingAverageOrDerivativeColumns);
    }
    case 'cumulative_sum': {
      const cumulativeSumColumns = convertToCumulativeSumColumns(columnsConverterArgs, window);
      return getValidColumns(cumulativeSumColumns);
    }
    case 'filter_ratio': {
      const formulaColumn = convertFilterRatioToFormulaColumn(columnsConverterArgs, window);
      return getValidColumns(formulaColumn);
    }
    case 'positive_rate': {
      const formulaColumn = convertToCounterRateFormulaColumn(columnsConverterArgs);
      return getValidColumns(formulaColumn);
    }
    case 'positive_only':
    case 'avg_bucket':
    case 'max_bucket':
    case 'min_bucket':
    case 'sum_bucket': {
      const formulaColumn = convertOtherAggsToFormulaColumn(
        aggregation,
        columnsConverterArgs,
        window
      );
      return getValidColumns(formulaColumn);
    }
    case 'top_hit': {
      const column = convertToLastValueColumn(columnsConverterArgs, window);
      return getValidColumns(column);
    }
    case 'static': {
      const column = convertToStaticValueColumn(columnsConverterArgs, {
        visibleSeriesCount,
        window,
      });
      return getValidColumns(column);
    }
    case 'std_deviation': {
      const column = convertToStandartDeviationColumn(columnsConverterArgs, window);
      return getValidColumns(column);
    }
    default: {
      const column = convertMetricAggregationColumnWithoutSpecialParams(
        aggregationMap,
        columnsConverterArgs,
        window
      );
      return getValidColumns(column);
    }
  }
};
