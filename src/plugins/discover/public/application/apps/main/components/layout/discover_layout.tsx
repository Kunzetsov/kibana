/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import './discover_layout.scss';
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  EuiSpacer,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHideFor,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { METRIC_TYPE } from '@kbn/analytics';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import classNames from 'classnames';
import { DiscoverNoResults } from '../no_results';
import { LoadingSpinner } from '../loading_spinner/loading_spinner';
import { DocTableLegacy } from '../../../../angular/doc_table/create_doc_table_react';
import {
  esFilters,
  IndexPatternField,
  indexPatterns as indexPatternsUtils,
} from '../../../../../../../data/public';
import { DiscoverSidebarResponsive } from '../sidebar';
import { DiscoverLayoutProps } from './types';
import { SortPairArr } from '../../../../angular/doc_table/lib/get_sort';
import {
  DOC_HIDE_TIME_COLUMN_SETTING,
  DOC_TABLE_LEGACY,
  SAMPLE_SIZE_SETTING,
  SEARCH_FIELDS_FROM_SOURCE,
} from '../../../../../../common';
import { popularizeField } from '../../../../helpers/popularize_field';
import { DocViewFilterFn } from '../../../../doc_views/doc_views_types';
import { DiscoverGrid } from '../../../../components/discover_grid/discover_grid';
import { DiscoverTopNav } from '../top_nav/discover_topnav';
import { ElasticSearchHit } from '../../../../doc_views/doc_views_types';
import { DiscoverChart } from '../chart';
import { getResultState } from '../../utils/get_result_state';
import { InspectorSession } from '../../../../../../../inspector/public';
import { DiscoverUninitialized } from '../uninitialized/uninitialized';
import { SavedSearchDataMessage } from '../../services/use_saved_search';
import { useDataGridColumns } from '../../../../helpers/use_data_grid_columns';
import { FetchStatus } from '../../../../types';

const DocTableLegacyMemoized = React.memo(DocTableLegacy);
const SidebarMemoized = React.memo(DiscoverSidebarResponsive);
const DataGridMemoized = React.memo(DiscoverGrid);
const TopNavMemoized = React.memo(DiscoverTopNav);
const DiscoverChartMemoized = React.memo(DiscoverChart);

interface DiscoverLayoutFetchState extends SavedSearchDataMessage {
  state: FetchStatus;
  fetchCounter: number;
  fieldCounts: Record<string, number>;
  rows: ElasticSearchHit[];
}

export function DiscoverLayout({
  indexPattern,
  indexPatternList,
  navigateTo,
  onChangeIndexPattern,
  onUpdateQuery,
  savedSearchRefetch$,
  resetQuery,
  savedSearchData$,
  savedSearch,
  searchSource,
  services,
  state,
  stateContainer,
}: DiscoverLayoutProps) {
  const { trackUiMetric, capabilities, indexPatterns, data, uiSettings, filterManager } = services;

  const sampleSize = useMemo(() => uiSettings.get(SAMPLE_SIZE_SETTING), [uiSettings]);
  const [expandedDoc, setExpandedDoc] = useState<ElasticSearchHit | undefined>(undefined);
  const [inspectorSession, setInspectorSession] = useState<InspectorSession | undefined>(undefined);
  const scrollableDesktop = useRef<HTMLDivElement>(null);
  const collapseIcon = useRef<HTMLButtonElement>(null);

  const [fetchState, setFetchState] = useState<DiscoverLayoutFetchState>({
    state: savedSearchData$.getValue().state,
    fetchCounter: 0,
    fieldCounts: {},
    rows: [],
  });
  const { state: fetchStatus, fetchCounter, inspectorAdapters, rows } = fetchState;

  useEffect(() => {
    const subscription = savedSearchData$.subscribe((next) => {
      if (
        (next.state && next.state !== fetchState.state) ||
        (next.fetchCounter && next.fetchCounter !== fetchState.fetchCounter) ||
        (next.rows && next.rows !== fetchState.rows) ||
        (next.chartData && next.chartData !== fetchState.chartData)
      ) {
        setFetchState({ ...fetchState, ...next });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [savedSearchData$, fetchState]);

  // collapse icon isn't displayed in mobile view, use it to detect which view is displayed
  const isMobile = () => collapseIcon && !collapseIcon.current;
  const timeField = useMemo(() => {
    return indexPatternsUtils.isDefault(indexPattern) ? indexPattern.timeFieldName : undefined;
  }, [indexPattern]);

  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const isLegacy = useMemo(() => uiSettings.get(DOC_TABLE_LEGACY), [uiSettings]);
  const useNewFieldsApi = useMemo(() => !uiSettings.get(SEARCH_FIELDS_FROM_SOURCE), [uiSettings]);

  const resultState = useMemo(() => getResultState(fetchStatus, rows!), [fetchStatus, rows]);

  const { columns, onAddColumn, onRemoveColumn, onMoveColumn, onSetColumns } = useDataGridColumns({
    capabilities,
    config: uiSettings,
    indexPattern,
    indexPatterns,
    setAppState: stateContainer.setAppState,
    state,
    useNewFieldsApi,
  });

  const onOpenInspector = useCallback(() => {
    // prevent overlapping
    if (inspectorAdapters) {
      setExpandedDoc(undefined);
      const session = services.inspector.open(inspectorAdapters, {
        title: savedSearch.title,
      });
      setInspectorSession(session);
    }
  }, [setExpandedDoc, inspectorAdapters, savedSearch, services.inspector]);

  useEffect(() => {
    return () => {
      if (inspectorSession) {
        // Close the inspector if this scope is destroyed (e.g. because the user navigates away).
        inspectorSession.close();
      }
    };
  }, [inspectorSession]);

  const onSort = useCallback(
    (sort: string[][]) => {
      stateContainer.setAppState({ sort });
    },
    [stateContainer]
  );

  const onAddFilter = useCallback(
    (field: IndexPatternField | string, values: string, operation: '+' | '-') => {
      const fieldName = typeof field === 'string' ? field : field.name;
      popularizeField(indexPattern, fieldName, indexPatterns);
      const newFilters = esFilters.generateFilters(
        filterManager,
        field,
        values,
        operation,
        String(indexPattern.id)
      );
      if (trackUiMetric) {
        trackUiMetric(METRIC_TYPE.CLICK, 'filter_added');
      }
      return filterManager.addFilters(newFilters);
    },
    [filterManager, indexPattern, indexPatterns, trackUiMetric]
  );
  /**
   * Legacy function, remove once legacy grid is removed
   */
  const onBackToTop = useCallback(() => {
    if (scrollableDesktop && scrollableDesktop.current) {
      scrollableDesktop.current.focus();
    }
    // Only the desktop one needs to target a specific container
    if (!isMobile() && scrollableDesktop.current) {
      scrollableDesktop.current.scrollTo(0, 0);
    } else if (window) {
      window.scrollTo(0, 0);
    }
  }, [scrollableDesktop]);

  const onResize = useCallback(
    (colSettings: { columnId: string; width: number }) => {
      const grid = { ...state.grid } || {};
      const newColumns = { ...grid.columns } || {};
      newColumns[colSettings.columnId] = {
        width: colSettings.width,
      };
      const newGrid = { ...grid, columns: newColumns };
      stateContainer.setAppState({ grid: newGrid });
    },
    [stateContainer, state]
  );

  const onEditRuntimeField = useCallback(() => {
    savedSearchRefetch$.next('reset');
  }, [savedSearchRefetch$]);

  const onDisableFilters = useCallback(() => {
    const disabledFilters = filterManager
      .getFilters()
      .map((filter) => ({ ...filter, meta: { ...filter.meta, disabled: true } }));
    filterManager.setFilters(disabledFilters);
  }, [filterManager]);

  const contentCentered = resultState === 'uninitialized' || resultState === 'none';
  const showTimeCol = useMemo(
    () => !uiSettings.get(DOC_HIDE_TIME_COLUMN_SETTING, false) && !!indexPattern.timeFieldName,
    [uiSettings, indexPattern.timeFieldName]
  );

  return (
    <I18nProvider>
      <EuiPage className="dscPage" data-fetch-counter={fetchCounter}>
        <TopNavMemoized
          indexPattern={indexPattern}
          onOpenInspector={onOpenInspector}
          query={state.query}
          navigateTo={navigateTo}
          savedQuery={state.savedQuery}
          savedSearch={savedSearch}
          searchSource={searchSource}
          services={services}
          stateContainer={stateContainer}
          updateQuery={onUpdateQuery}
        />
        <EuiPageBody className="dscPageBody" aria-describedby="savedSearchTitle">
          <h1 id="savedSearchTitle" className="euiScreenReaderOnly">
            {savedSearch.title}
          </h1>
          <EuiFlexGroup className="dscPageBody__contents" gutterSize="none">
            <EuiFlexItem grow={false}>
              <SidebarMemoized
                columns={columns}
                fieldCounts={fetchState.fieldCounts}
                hits={rows}
                indexPatternList={indexPatternList}
                onAddField={onAddColumn}
                onAddFilter={onAddFilter}
                onRemoveField={onRemoveColumn}
                onChangeIndexPattern={onChangeIndexPattern}
                selectedIndexPattern={indexPattern}
                services={services}
                state={state}
                isClosed={isSidebarClosed}
                trackUiMetric={trackUiMetric}
                useNewFieldsApi={useNewFieldsApi}
                onEditRuntimeField={onEditRuntimeField}
              />
            </EuiFlexItem>
            <EuiHideFor sizes={['xs', 's']}>
              <EuiFlexItem grow={false}>
                <div>
                  <EuiSpacer size="s" />
                  <EuiButtonIcon
                    iconType={isSidebarClosed ? 'menuRight' : 'menuLeft'}
                    iconSize="m"
                    size="xs"
                    onClick={() => setIsSidebarClosed(!isSidebarClosed)}
                    data-test-subj="collapseSideBarButton"
                    aria-controls="discover-sidebar"
                    aria-expanded={isSidebarClosed ? 'false' : 'true'}
                    aria-label={i18n.translate('discover.toggleSidebarAriaLabel', {
                      defaultMessage: 'Toggle sidebar',
                    })}
                    buttonRef={collapseIcon}
                  />
                </div>
              </EuiFlexItem>
            </EuiHideFor>
            <EuiFlexItem className="dscPageContent__wrapper">
              <EuiPageContent
                verticalPosition={contentCentered ? 'center' : undefined}
                horizontalPosition={contentCentered ? 'center' : undefined}
                paddingSize="none"
                hasShadow={false}
                className={classNames('dscPageContent', {
                  'dscPageContent--centered': contentCentered,
                  'dscPageContent--emptyPrompt': resultState === 'none',
                })}
              >
                {resultState === 'none' && (
                  <DiscoverNoResults
                    timeFieldName={timeField}
                    data={data}
                    error={fetchState.fetchError}
                    hasQuery={!!state.query?.query}
                    hasFilters={
                      state.filters && state.filters.filter((f) => !f.meta.disabled).length > 0
                    }
                    onDisableFilters={onDisableFilters}
                  />
                )}
                {resultState === 'uninitialized' && (
                  <DiscoverUninitialized onRefresh={() => savedSearchRefetch$.next()} />
                )}
                {resultState === 'loading' && <LoadingSpinner />}
                {resultState === 'ready' && (
                  <EuiFlexGroup
                    className="dscPageContent__inner"
                    direction="column"
                    alignItems="stretch"
                    gutterSize="none"
                    responsive={false}
                  >
                    <EuiFlexItem grow={false}>
                      <DiscoverChartMemoized
                        config={uiSettings}
                        chartData={fetchState.chartData}
                        bucketInterval={fetchState.bucketInterval}
                        data={data}
                        hits={fetchState.hits}
                        indexPattern={indexPattern}
                        isLegacy={isLegacy}
                        state={state}
                        resetQuery={resetQuery}
                        savedSearch={savedSearch}
                        stateContainer={stateContainer}
                        timefield={timeField}
                      />
                    </EuiFlexItem>
                    <EuiHorizontalRule margin="none" />

                    <EuiFlexItem className="eui-yScroll">
                      <section
                        className="dscTable eui-yScroll eui-xScroll"
                        aria-labelledby="documentsAriaLabel"
                        ref={scrollableDesktop}
                        tabIndex={-1}
                      >
                        <h2 className="euiScreenReaderOnly" id="documentsAriaLabel">
                          <FormattedMessage
                            id="discover.documentsAriaLabel"
                            defaultMessage="Documents"
                          />
                        </h2>
                        {isLegacy && rows && rows.length && (
                          <DocTableLegacyMemoized
                            columns={columns}
                            indexPattern={indexPattern}
                            rows={rows}
                            sort={state.sort || []}
                            searchDescription={savedSearch.description}
                            searchTitle={savedSearch.lastSavedTitle}
                            onAddColumn={onAddColumn}
                            onBackToTop={onBackToTop}
                            onFilter={onAddFilter}
                            onMoveColumn={onMoveColumn}
                            onRemoveColumn={onRemoveColumn}
                            onSort={onSort}
                            sampleSize={sampleSize}
                            useNewFieldsApi={useNewFieldsApi}
                          />
                        )}
                        {!isLegacy && rows && rows.length && (
                          <div className="dscDiscoverGrid">
                            <DataGridMemoized
                              ariaLabelledBy="documentsAriaLabel"
                              columns={columns}
                              expandedDoc={expandedDoc}
                              indexPattern={indexPattern}
                              isLoading={fetchStatus === 'loading'}
                              rows={rows}
                              sort={(state.sort as SortPairArr[]) || []}
                              sampleSize={sampleSize}
                              searchDescription={savedSearch.description}
                              searchTitle={savedSearch.lastSavedTitle}
                              setExpandedDoc={setExpandedDoc}
                              showTimeCol={showTimeCol}
                              services={services}
                              settings={state.grid}
                              onAddColumn={onAddColumn}
                              onFilter={onAddFilter as DocViewFilterFn}
                              onRemoveColumn={onRemoveColumn}
                              onSetColumns={onSetColumns}
                              onSort={onSort}
                              onResize={onResize}
                              useNewFieldsApi={useNewFieldsApi}
                            />
                          </div>
                        )}
                      </section>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )}
              </EuiPageContent>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageBody>
      </EuiPage>
    </I18nProvider>
  );
}
