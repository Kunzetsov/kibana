/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { compact, cloneDeep, last, map } from 'lodash';
import { Chart, Settings, Position, Axis, TooltipType, YDomainRange } from '@elastic/charts';

import { IInterpreterRenderHandlers } from 'src/plugins/expressions';
import { useKibana } from '../../../kibana_react/public';

import { AreaSeriesComponent } from './area_series';
import { BarSeriesComponent } from './bar_series';

import { buildOptions, colors, Axis as IAxis, Options } from '../helpers/panel_utils';
import { tickFormatters } from '../helpers/tick_formatters';

import { Series, Sheet } from '../helpers/timelion_request_handler';
import { TimelionVisDependencies } from '../plugin';

import './index.scss';

const GRID_LINE_STROKE = 'rgba(125,125,125,0.3)';

interface TimelionVisComponentProps {
  fireEvent: IInterpreterRenderHandlers['event'];
  interval: string;
  seriesList: Sheet;
  renderComplete: IInterpreterRenderHandlers['done'];
}

function TimelionVisComponent({
  interval,
  seriesList,
  renderComplete,
  fireEvent,
}: TimelionVisComponentProps) {
  const kibana = useKibana<TimelionVisDependencies>();
  const [chart, setChart] = useState(() => cloneDeep(seriesList.list));
  const [options, setOptions] = useState<Options>(
    buildOptions(interval, kibana.services.timefilter, kibana.services.uiSettings)
  );

  const updateYAxes = function (yaxes: IAxis[]) {
    yaxes.forEach((yaxis: IAxis) => {
      if (yaxis.units) {
        const formatters = tickFormatters(yaxis);
        yaxis.tickFormatter = formatters[yaxis.units.type as keyof typeof formatters];
      } else if (yaxis.tickDecimals) {
        yaxis.tickFormatter = (val: number) => val.toFixed(yaxis.tickDecimals);
      }

      yaxis.domain = {};

      if (yaxis.max) {
        yaxis.domain.max = yaxis.max;
      }

      if (yaxis.min) {
        yaxis.domain.min = yaxis.min;
      }
    });
  };

  useEffect(() => {
    const newChart = seriesList.list.map((series: Series, seriesIndex: number) => {
      const newSeries = { ...series };
      if (!newSeries.color) {
        const colorIndex = seriesIndex % colors.length;
        newSeries.color = colors[colorIndex];
      }

      if (newSeries._global?.yaxes) {
        updateYAxes(newSeries._global.yaxes);
      }

      return newSeries;
    });

    setChart(newChart);
  }, [seriesList.list]);

  useEffect(() => {
    setOptions(buildOptions(interval, kibana.services.timefilter, kibana.services.uiSettings));
  }, [interval, kibana.services.timefilter, kibana.services.uiSettings]);

  // temp solution, will be changed after fix https://github.com/elastic/elastic-charts/issues/878
  const getLegendPosition = useCallback(() => {
    const chartGlobal = chart[0]._global;
    if (chartGlobal && chartGlobal.legend) {
      switch (chartGlobal.legend.position) {
        case 'ne':
          return Position.Right;
        case 'nw':
          return Position.Left;
        case 'se':
          return Position.Right;
        case 'sw':
          return Position.Left;
      }
    }
    return Position.Left;
  }, [chart]);

  const brushEndListener = useCallback(
    ({ x }) => {
      if (!x) {
        return;
      }

      fireEvent({
        name: 'applyFilter',
        data: {
          timeFieldName: '*',
          filters: [
            {
              range: {
                '*': {
                  gte: x[0],
                  lte: x[1],
                },
              },
            },
          ],
        },
      });
    },
    [fireEvent]
  );

  const onRenderChange = useCallback(
    (isRendered: boolean) => {
      if (!isRendered) {
        renderComplete();
      }
    },
    [renderComplete]
  );

  const title: string = useMemo(() => last(compact(map(seriesList.list, '_title'))) || '', [
    seriesList.list,
  ]);

  return (
    <div className="timelionChart">
      <div className="timelionChart__topTitle">{title}</div>
      <Chart renderer="canvas" size={{ width: '100%' }}>
        <Settings
          onBrushEnd={brushEndListener}
          showLegend
          legendPosition={getLegendPosition()}
          onRenderChange={onRenderChange}
          theme={[
            {
              crosshair: {
                band: {
                  fill: options.crosshair.color,
                },
                line: {
                  strokeWidth: options.crosshair.lineWidth,
                },
              },
            },
          ]}
          tooltip={{
            snap: true,
            type: TooltipType.VerticalCursor,
          }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          showOverlappingTicks
          tickFormat={options.xaxis.tickFormatter}
        />
        {chart[0]._global?.yaxes ? (
          chart[0]._global.yaxes.map((axis: IAxis, index: number) => {
            return (
              <Axis
                key={index}
                id={axis.position + axis.axisLabel}
                title={axis.axisLabel}
                position={axis.position}
                tickFormat={axis.tickFormatter}
                gridLine={{
                  stroke: GRID_LINE_STROKE,
                  visible: true,
                }}
                domain={axis.domain as YDomainRange}
              />
            );
          })
        ) : (
          <Axis
            id="left"
            position={Position.Left}
            gridLine={{
              stroke: GRID_LINE_STROKE,
              visible: true,
            }}
          />
        )}
        {chart.map((data, index) => {
          const key = `${index}-${data.label}`;
          if (data.bars) {
            return <BarSeriesComponent key={key} data={data} index={index} />;
          } else {
            return <AreaSeriesComponent key={key} data={data} index={index} />;
          }
        })}
      </Chart>
    </div>
  );
}

// default export required for React.Lazy
// eslint-disable-next-line import/no-default-export
export { TimelionVisComponent as default };
