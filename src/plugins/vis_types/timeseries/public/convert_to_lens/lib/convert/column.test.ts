/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { METRIC_TYPES } from '@kbn/data-plugin/public';
import {
  createStubDataView,
  stubLogstashDataView,
} from '@kbn/data-views-plugin/common/data_view.stub';
import { stubLogstashFieldSpecMap } from '@kbn/data-views-plugin/common/field.stub';
import { Metric } from '../../../../common/types';
import { createSeries } from '../__mocks__';
import { createColumn, getFormat } from './column';

describe('getFormat', () => {
  const series = createSeries();
  const dataViewWithoutSupportedFormatsFields = createStubDataView({
    spec: {
      id: 'logstash-*',
      title: 'logstash-*',
      timeFieldName: 'time',
      fields: stubLogstashFieldSpecMap,
    },
  });

  beforeEach(() => {
    dataViewWithoutSupportedFormatsFields.getFormatterForField = jest
      .fn()
      .mockImplementation(() => ({
        type: {
          id: 'date',
        },
      }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('should return formatter of the field, if formatter is set to default', () => {
    expect(getFormat(series, stubLogstashDataView.fields[0].name, stubLogstashDataView)).toEqual({
      format: { id: 'bytes' },
    });
  });

  test("should return no formatter, if a field with a specified name doesn't exist", () => {
    expect(getFormat(series, 'some-other-name', stubLogstashDataView)).toEqual({});
  });

  test('should return no formatter, if the type of the field is not supported', () => {
    expect(
      getFormat(
        series,
        dataViewWithoutSupportedFormatsFields.fields[2].name,
        dataViewWithoutSupportedFormatsFields
      )
    ).toEqual({});
  });

  test('should return formatter value, if formatter is not set to default', () => {
    const formatter = 'percent';
    expect(
      getFormat(
        createSeries({ formatter }),
        stubLogstashDataView.fields[0].name,
        stubLogstashDataView
      )
    ).toEqual({
      format: { id: formatter },
    });
  });

  test('should not return formatter value, if formatter is set to not suppported format', () => {
    const formatter = 'date';
    expect(
      getFormat(
        createSeries({ formatter }),
        stubLogstashDataView.fields[0].name,
        stubLogstashDataView
      )
    ).toEqual({});
  });
});

describe('createColumn', () => {
  const field = stubLogstashDataView.fields[0];
  const scaleUnit = 's';
  const metric: Metric = {
    id: 'some-id',
    type: METRIC_TYPES.AVG,
    field: field.name,
  };

  const metricWithTimeScale: Metric = {
    id: 'some-other-id',
    type: METRIC_TYPES.TOP_HITS,
    field: field.name,
    unit: `1${scaleUnit}`,
  };

  const customLabel = 'some custom';
  const window = 'some-window';
  const filter = { query: 'some-query', language: 'lucene' };

  test.each([
    [
      'with default params',
      { seriesArgs: { metrics: [metric], label: '' }, field, metric, extraFields: undefined },
      {
        isBucketed: false,
        isSplit: false,
        label: '',
        meta: { metricId: metric.id },
        dataType: field?.type,
      },
    ],
    [
      'with specified params',
      {
        seriesArgs: {
          metrics: [metricWithTimeScale],
          label: customLabel,
          filter,
        },
        field,
        metric: metricWithTimeScale,
        extraFields: { window, isBucketed: true, isSplit: true },
      },
      {
        isBucketed: true,
        isSplit: true,
        window,
        label: customLabel,
        meta: { metricId: metricWithTimeScale.id },
        filter,
        timeScale: scaleUnit,
        dataType: field?.type,
      },
    ],
    [
      'without field',
      {
        seriesArgs: { metrics: [metric], label: '' },
        field: undefined,
        metric,
        extraFields: undefined,
      },
      {
        isBucketed: false,
        isSplit: false,
        label: '',
        meta: { metricId: metric.id },
        dataType: undefined,
      },
    ],
  ])(
    'should create column by metric %s',
    (_, { seriesArgs, field: specifiedField, metric: specifiedMetric, extraFields }, expected) => {
      const series = createSeries(seriesArgs);
      const column = createColumn(series, specifiedMetric, specifiedField, extraFields);

      expect(column).toEqual(expect.objectContaining(expected));
      expect(typeof column.columnId === 'string' && column.columnId.length > 0).toBeTruthy();
    }
  );
});
