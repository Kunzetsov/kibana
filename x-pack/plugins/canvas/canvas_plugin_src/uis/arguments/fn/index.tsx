/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DropResult,
  EuiDragDropContext,
  euiDragDropReorder,
  EuiDraggable,
  EuiDroppable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  htmlIdGenerator,
} from '@elastic/eui';
import { DatatableColumn, ExpressionAstExpression } from 'src/plugins/expressions';
import { templateFromReactComponent } from '../../../../public/lib/template_from_react_component';
import { ArgumentStrings } from '../../../../i18n';
import { ArgAddPopover } from '../../../../public/components/arg_add_popover';
// @ts-expect-error untyped component
import { SidebarSectionTitle } from '../../../../public/components/sidebar/sidebar_section_title';
import { Expression, expressions } from './config';
import { forms } from './forms';

const makeId = htmlIdGenerator();

const { VisDimension: strings } = ArgumentStrings;

interface ExpressionInstance {
  expression: Expression;
  id: string;
}

const FnArgInput = (props: {
  // @todo define types
  [key: string]: any;
}) => {
  const [selectedExpressions, setSelectedExpressions] = useState<ExpressionInstance[]>([]);
  const onValueAdd = (expr: Expression) => () =>
    setSelectedExpressions([...selectedExpressions, { expression: expr, id: makeId() }]);

  const onValueRemove = (exprIndex: number) => () =>
    setSelectedExpressions(selectedExpressions.filter((expr, index) => index !== exprIndex));

  const options = expressions.map((expr) => ({
    arg: {
      help: expr.help,
      displayName: expr.name,
      name: expr.name,
    },
    onValueAdd: onValueAdd(expr.expression),
  }));

  const expressionForms = selectedExpressions.map((expr, index) => {
    const FormComponent = forms[expr.expression] ?? (() => {});
    const expression = expressions.filter((e) => e.expression === expr.expression)[0];
    return (
      <EuiDraggable spacing="s" key={expression.expression} index={index} draggableId={expr.id}>
        <FormComponent {...props} expr={expression} onValueRemove={onValueRemove(index)} />
      </EuiDraggable>
    );
  });
  const onDragEnd = ({ source, destination }: DropResult) => {
    if (source && destination) {
      const items = euiDragDropReorder(selectedExpressions, source.index, destination.index);

      setSelectedExpressions(items);
    }
  };

  return (
    <>
      <SidebarSectionTitle title={''}>
        {options.length === 0 ? null : <ArgAddPopover options={options} />}
      </SidebarSectionTitle>
      <EuiFlexGroup
        className="canvasSidebar__panelTitle"
        gutterSize="xs"
        alignItems="center"
        justifyContent="spaceBetween"
      >
        <EuiFlexItem>
          <EuiDragDropContext onDragEnd={onDragEnd}>
            <EuiDroppable droppableId={makeId()} spacing="m" grow={false}>
              {expressionForms}
            </EuiDroppable>
          </EuiDragDropContext>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export const fn = () => ({
  name: 'fn',
  displayName: 'Fn',
  help: 'Fn help',
  simpleTemplate: templateFromReactComponent(FnArgInput),
});
