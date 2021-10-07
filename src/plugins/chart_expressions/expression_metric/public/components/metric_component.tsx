/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { Component } from 'react';
import { MetricVisValue } from './metric_value';
import { MetricInput, VisParams, MetricOptions } from '../../common/types';
import type { IFieldFormat } from '../../../../field_formats/common';
import { Datatable } from '../../../../expressions/public';
import { CustomPaletteState } from '../../../../charts/public';
import { getFormatService, getPaletteService } from '../../../expression_metric/public/services';
import { ExpressionValueVisDimension } from '../../../../visualizations/public';
import { formatValue, getMinMaxForColumns, MinMax, shouldApplyColor } from '../utils';

import './metric.scss';
import { getColumnByAccessor } from '../utils/accessor';
import { needsLightText } from '../utils/palette';

export interface MetricVisComponentProps {
  visParams: Pick<VisParams, 'metric' | 'dimensions'>;
  visData: MetricInput;
  fireEvent: (event: any) => void;
  renderComplete: () => void;
}

class MetricVisComponent extends Component<MetricVisComponentProps> {
  private getColor(value: number, paletteParams: CustomPaletteState | undefined, minMax: MinMax) {
    return getPaletteService().get('custom')?.getColorForValue?.(value, paletteParams, minMax);
  }

  private processTableGroups(table: Datatable) {
    const { metric: metricConfig, dimensions } = this.props.visParams;
    const { percentageMode: isPercentageMode, style, palette } = metricConfig;
    const { stops = [] } = palette ?? {};
    const min = stops[0];
    const max = stops[stops.length - 1];

    let bucketColumnId: string;
    let bucketFormatter: IFieldFormat;

    if (dimensions.bucket) {
      bucketColumnId = getColumnByAccessor(dimensions.bucket.accessor, table.columns).id;
      bucketFormatter = getFormatService().deserialize(dimensions.bucket.format);
    }

    return dimensions.metrics.reduce(
      (acc: MetricOptions[], metric: ExpressionValueVisDimension) => {
        const column = getColumnByAccessor(metric.accessor, table?.columns);
        const formatter = getFormatService().deserialize(metric.format);
        const minMax = getMinMaxForColumns(table);
        const metrics = table.rows.map((row, rowIndex) => {
          let title = column.name;
          let value: number = row[column.id];
          const columnMinMax = minMax[column.id];
          const color = this.getColor(value, palette, columnMinMax);

          if (isPercentageMode && stops.length) {
            value = (value - min) / (max - min);
          }

          const formattedValue = formatValue(value, formatter, 'html');
          if (bucketColumnId) {
            const bucketValue = formatValue(row[bucketColumnId], bucketFormatter);
            title = `${bucketValue} - ${title}`;
          }

          const shouldBrush = stops.length > 1 && shouldApplyColor(color ?? '');
          return {
            label: title,
            value: formattedValue,
            color: shouldBrush && (style.labelColor ?? false) ? color : undefined,
            bgColor: shouldBrush && (style.bgColor ?? false) ? color : undefined,
            lightText: shouldBrush && (style.bgColor ?? false) && needsLightText(color),
            rowIndex,
          };
        });

        return [...acc, ...metrics];
      },
      []
    );
  }

  private filterBucket = (metric: MetricOptions) => {
    const { dimensions } = this.props.visParams;
    if (!dimensions.bucket) {
      return;
    }

    const table = this.props.visData;
    this.props.fireEvent({
      name: 'filterBucket',
      data: {
        data: [
          {
            table,
            column: dimensions.bucket.accessor,
            row: metric.rowIndex,
          },
        ],
      },
    });
  };

  private renderMetric = (metric: MetricOptions, index: number) => {
    return (
      <MetricVisValue
        key={index}
        metric={metric}
        fontSize={this.props.visParams.metric.style.fontSize}
        onFilter={this.props.visParams.dimensions.bucket ? this.filterBucket : undefined}
        showLabel={this.props.visParams.metric.labels.show}
      />
    );
  };

  componentDidMount() {
    this.props.renderComplete();
  }

  componentDidUpdate() {
    this.props.renderComplete();
  }

  render() {
    let metricsHtml;
    if (this.props.visData) {
      const metrics = this.processTableGroups(this.props.visData);
      metricsHtml = metrics.map(this.renderMetric);
    }
    return metricsHtml;
  }
}

// default export required for React.Lazy
// eslint-disable-next-line import/no-default-export
export { MetricVisComponent as default };
