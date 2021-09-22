/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { compact } from 'lodash';

import { i18n } from '@kbn/i18n';

import { DatatableColumn } from '../../../../expressions/public';

import { getFormatService } from '../services';
import { getColumnByAccessor } from '../../common/utils/accessors';
import { Aspect, Aspects, Dimension, Dimensions } from '../../common/types';

export function getEmptyAspect(): Aspect {
  return {
    accessor: null,
    title: i18n.translate('expressionXy.response.allDocsTitle', {
      defaultMessage: 'All docs',
    }),
    params: {
      defaultValue: '_all',
    },
  };
}
export function getAspects(
  columns: DatatableColumn[],
  { x, y, z, series, splitColumn, splitRow }: Dimensions
): Aspects {
  const seriesDimensions = Array.isArray(series) || series === undefined ? series : [series];

  return {
    x: getAspectsFromDimension(columns, x) ?? getEmptyAspect(),
    y: getAspectsFromDimensions(columns, y) ?? [],
    z: z && z?.length > 0 ? getAspectsFromDimension(columns, z[0]) : undefined,
    series: getAspectsFromDimensions(columns, seriesDimensions),
    splitColumn: splitColumn?.length ? getAspectsFromDimension(columns, splitColumn[0]) : undefined,
    splitRow: splitRow?.length ? getAspectsFromDimension(columns, splitRow[0]) : undefined,
  };
}

function getAspectsFromDimension(
  columns: DatatableColumn[],
  dimension?: Dimension | null
): Aspect | undefined {
  if (!dimension) {
    return;
  }

  const column = getColumnByAccessor(columns, dimension.accessor);
  return column && getAspect(column, dimension);
}

function getAspectsFromDimensions(
  columns: DatatableColumn[],
  dimensions: Dimension[] | undefined = []
): Aspect[] | undefined {
  return compact(dimensions.map((d) => getAspectsFromDimension(columns, d)));
}

const getAspect = (
  { id: accessor, name: title }: DatatableColumn,
  { accessor: column, format, params, id }: Dimension
): Aspect => ({
  accessor,
  column,
  title,
  format,
  formatter: (value: any) => getFormatService().deserialize(format).convert(value),
  params,
  id,
});
