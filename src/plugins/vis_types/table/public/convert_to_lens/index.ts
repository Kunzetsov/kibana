/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getVisSchemas, Vis, AdditionalVisParams } from '@kbn/visualizations-plugin/public';
import { TableVisParams } from '../../common';

const getMetrics = (schemas: ReturnType<typeof getVisSchemas>, visParams: TableVisParams) => {
  const metrics = [...schemas.metric];

  if (schemas.bucket && visParams.showPartialRows && !visParams.showMetricsAtAllLevels) {
    // Handle case where user wants to see partial rows but not metrics at all levels.
    // This requires calculating how many metrics will come back in the tabified response,
    // and removing all metrics from the dimensions except the last set.
    const metricsPerBucket = metrics.length / schemas.bucket.length;
    metrics.splice(0, metricsPerBucket * schemas.bucket.length - metricsPerBucket);
  }

  return metrics;
};

export const convertVisToLensConfiguration = (
  vis: Vis<TableVisParams>,
  params: AdditionalVisParams
) => {
  /**
  const { indexPattern } = vis.data;

  if (!indexPattern || !indexPattern.id) {
    return null;
  }

  const schemas = getVisSchemas(vis, params, true);
  // const metrics = getMetrics(schemas, vis.params);
  const splitWithDateHistogramFields = [
    ...(schemas.bucket ?? []),
    ...(schemas.split_column ?? []),
    ...(schemas.split_row ?? []),
  ].filter(({ aggType }) => aggType === 'date_histogram');

  const splitWithDateHistogram = splitWithDateHistogramFields.length > 0;

  const layer: AggBasedTableToLensTableLayerContext = {
    fromVisType: ConvertToLensVisTypes.AGG_BASED_TABLE,
    indexPatternId: indexPattern.id,
    metrics: [],
    buckets: [],
    splitRows: [],
    splitColumns: [],
    splitWithDateHistogram,
    timeFieldName: indexPattern.timeFieldName,
  };
  */
  return null;
};
