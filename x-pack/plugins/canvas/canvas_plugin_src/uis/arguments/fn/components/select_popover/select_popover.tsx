/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { MouseEventHandler, FC, ReactElement, JSXElementConstructor } from 'react';
import {
  EuiButtonIcon,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
} from '@elastic/eui';
import { Popover } from '../../../../../../public/components/popover';

import './select_popover.scss';

interface Option {
  displayName: string;
  help: string;
  onValueAdd: () => void;
}

interface Props {
  options: Option[];
  button?: (
    handleClick: MouseEventHandler<HTMLButtonElement>
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
}

export const SelectPopover: FC<Props> = ({ options, button }) => {
  const defaultButton = (handleClick: MouseEventHandler<HTMLButtonElement>) => (
    <EuiButtonIcon
      iconType="plusInCircle"
      aria-label={'Add argument'}
      onClick={handleClick}
      className="canvasSelectPopover__addOption"
    />
  );

  const selectButton = button ?? defaultButton;

  return (
    <Popover
      panelPaddingSize="none"
      button={selectButton}
      className="canvasSelectPopover__addPopover"
      anchorClassName="canvasSelectPopover__anchor"
    >
      {({ closePopover }) =>
        options.map((opt) => (
          <button
            className="canvasSelectPopover__add"
            onClick={() => {
              opt.onValueAdd();
              closePopover();
            }}
          >
            <EuiDescriptionList compressed>
              <EuiDescriptionListTitle>{opt.displayName}</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                <small>{opt.help}</small>
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </button>
        ))
      }
    </Popover>
  );
};
