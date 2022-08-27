/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { METRIC_TYPES } from '@kbn/data-plugin/public';
import { FormulaParams } from '@kbn/visualizations-plugin/common/convert_to_lens';
import { CommonColumnConverterArgs, CommonColumnsConverterArgs, FormulaColumn } from './types';
import { TSVB_METRIC_TYPES } from '../../../../common/enums';
import type { Metric } from '../../../../common/types';
import { getFormulaEquivalent, getSiblingPipelineSeriesFormula } from '../metrics';
import { createColumn, getFormat } from './column';

type OtherFormulaAggregations =
  | typeof TSVB_METRIC_TYPES.POSITIVE_ONLY
  | typeof METRIC_TYPES.AVG_BUCKET
  | typeof METRIC_TYPES.MAX_BUCKET
  | typeof METRIC_TYPES.MIN_BUCKET
  | typeof METRIC_TYPES.SUM_BUCKET;

const convertToFormulaParams = (formula: string): FormulaParams => ({
  formula,
});

export const createFormulaColumn = (
  formula: string,
  { series, metric, dataView }: CommonColumnConverterArgs
): FormulaColumn | null => {
  const params = convertToFormulaParams(formula);
  return {
    operationType: 'formula',
    references: [],
    ...createColumn(series, metric),
    params: { ...params, ...getFormat(series, metric.field, dataView) },
  };
};

const convertFormulaScriptForPercentileAggs = (
  mathScript: string,
  variables: Exclude<Metric['variables'], undefined>,
  metric: Metric,
  allAggMetrics: Metric[],
  window?: string
) => {
  variables.forEach((variable) => {
    const [_, meta] = variable?.field?.split('[') ?? [];
    const metaValue = Number(meta?.replace(']', ''));
    if (!metaValue) {
      return;
    }
    const script = getFormulaEquivalent(metric, allAggMetrics, { metaValue, window });
    if (!script) {
      return;
    }
    mathScript = mathScript?.replace(`params.${variable.name}`, script);
  });
  return mathScript;
};

const convertFormulaScriptForAggs = (
  mathScript: string,
  variables: Exclude<Metric['variables'], undefined>,
  metric: Metric,
  allAggMetrics: Metric[],
  window?: string
) => {
  const script = getFormulaEquivalent(metric, allAggMetrics, { window });
  if (!script) {
    return null;
  }
  const variable = variables.find((v) => v.field === metric.id);
  return mathScript?.replaceAll(`params.${variable?.name}`, script);
};

export const convertMathToFormulaColumn = (
  { series, metrics, dataView }: CommonColumnsConverterArgs,
  window?: string
): FormulaColumn | null => {
  // find the metric idx that has math expression
  const metric = metrics.find(({ type }) => type === 'math');
  if (!metric) {
    return null;
  }

  const { variables } = metric;
  let script: string | null | undefined = metrics[metrics.length - 1].script;
  if (!script || !variables || !variables.length) {
    return null;
  }

  const metricsWithoutMath = metrics.filter(({ type }) => type !== 'math');

  // create the script
  for (const notMathMetric of metricsWithoutMath) {
    // We can only support top_hit with size 1
    if (
      (notMathMetric.type === 'top_hit' &&
        notMathMetric?.size &&
        Number(notMathMetric?.size) !== 1) ||
      notMathMetric?.order === 'asc'
    ) {
      return null;
    }

    // should treat percentiles differently
    if (notMathMetric.type === 'percentile' || notMathMetric.type === 'percentile_rank') {
      script = convertFormulaScriptForPercentileAggs(
        script!,
        variables,
        notMathMetric,
        metrics,
        window
      );
    } else {
      script = convertFormulaScriptForAggs(script!, variables, notMathMetric, metrics, window);
    }
  }

  if (script === null) {
    return null;
  }

  const scripthasNoStaticNumber = isNaN(Number(script));
  if (script.includes('params') || !scripthasNoStaticNumber) {
    return null;
  }

  return createFormulaColumn(script, { series, metric, dataView });
};

export const convertOtherAggsToFormulaColumn = (
  aggregation: OtherFormulaAggregations,
  { series, metrics, dataView }: CommonColumnsConverterArgs,
  window?: string
): FormulaColumn | null => {
  const metric = metrics[metrics.length - 1];

  const formula = getSiblingPipelineSeriesFormula(aggregation, metric, metrics, window);
  if (!formula) {
    return null;
  }
  return createFormulaColumn(formula, { series, metric, dataView });
};
