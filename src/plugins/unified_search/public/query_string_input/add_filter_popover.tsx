/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useCallback } from 'react';
import {
  EuiFlexItem,
  EuiButtonIcon,
  EuiPopover,
  EuiButtonIconProps,
  EuiToolTip,
  useEuiTheme,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { Filter } from '@kbn/es-query';
import type { DataView } from '@kbn/data-views-plugin/public';
import { FilterEditorWrapper } from './filter_editor_wrapper';
import { popoverDragAndDropCss } from './add_filter_popover.styles';
import {
  withCloseFilterEditorConfirmModal,
  WithCloseFilterEditorConfirmModalProps,
} from '../filter_bar/filter_editor';

export const strings = {
  getAddFilterButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.filterBar.addFilterButtonLabel', {
      defaultMessage: 'Add filter',
    }),
};

interface AddFilterPopoverProps extends WithCloseFilterEditorConfirmModalProps {
  indexPatterns?: Array<DataView | string>;
  filters: Filter[];
  timeRangeForSuggestionsOverride?: boolean;
  onFiltersUpdated?: (filters: Filter[]) => void;
  isDisabled?: boolean;
  buttonProps?: Partial<EuiButtonIconProps>;
}

const AddFilterPopoverComponent = React.memo(function AddFilterPopover({
  indexPatterns,
  filters,
  timeRangeForSuggestionsOverride,
  onFiltersUpdated,
  onCloseFilterPopover,
  buttonProps,
  isDisabled,
}: AddFilterPopoverProps) {
  const euiTheme = useEuiTheme();
  const [showAddFilterPopover, setShowAddFilterPopover] = useState(false);
  const [updatedFilter, setUpdatedFilter] = useState<Filter>();
  const [originalFilter, setOriginalFilter] = useState<Filter>();

  const button = (
    <EuiToolTip delay="long" content={strings.getAddFilterButtonLabel()}>
      <EuiButtonIcon
        display="base"
        iconType="plusInCircleFilled"
        aria-label={strings.getAddFilterButtonLabel()}
        data-test-subj="addFilter"
        onClick={() => setShowAddFilterPopover((isOpen) => !isOpen)}
        size="m"
        disabled={isDisabled}
        {...buttonProps}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      />
    </EuiToolTip>
  );

  const closePopover = useCallback(() => {
    onCloseFilterPopover(originalFilter, updatedFilter, [() => setShowAddFilterPopover(false)]);
  }, [originalFilter, updatedFilter, setShowAddFilterPopover, onCloseFilterPopover]);

  return (
    <EuiFlexItem grow={false}>
      <EuiPopover
        id="addFilterPopover"
        button={button}
        isOpen={showAddFilterPopover}
        closePopover={() => {
          closePopover();
        }}
        anchorPosition="downLeft"
        panelPaddingSize="none"
        panelProps={{
          'data-test-subj': 'addFilterPopover',
          css: popoverDragAndDropCss(euiTheme),
        }}
        initialFocus=".filterEditor__hiddenItem"
        ownFocus
        repositionOnScroll
      >
        <FilterEditorWrapper
          indexPatterns={indexPatterns}
          filters={filters}
          timeRangeForSuggestionsOverride={timeRangeForSuggestionsOverride}
          onFiltersUpdated={onFiltersUpdated}
          onLocalFilterUpdate={setUpdatedFilter}
          onLocalFilterCreate={setOriginalFilter}
          closePopoverOnAdd={() => {
            setShowAddFilterPopover(false);
          }}
          closePopoverOnCancel={() => {
            closePopover();
          }}
        />
      </EuiPopover>
    </EuiFlexItem>
  );
});

export const AddFilterPopover = withCloseFilterEditorConfirmModal(AddFilterPopoverComponent);
