/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { ArgumentStrings } from '../../../../i18n';

const { DataColumn: strings } = ArgumentStrings;

export enum Expression {
  math = 'math',
  getCell = 'getCell',
  all = 'all',
  any = 'any',
  eq = 'eq',
  gte = 'gte',
  gt = 'gt',
  lte = 'lte',
  lt = 'lt',
  neq = 'neq',
  as = 'as',
}

export const expressions = [
  { expression: Expression.math, name: 'math', help: 'help' },
  { expression: Expression.getCell, name: 'getCell', help: 'help' },
  { expression: Expression.all, name: 'all', help: 'help' },
  { expression: Expression.any, name: 'any', help: 'help' },
  { expression: Expression.eq, name: 'eq', help: 'help' },
  { expression: Expression.gte, name: 'gte', help: 'help' },
  { expression: Expression.gt, name: 'gt', help: 'help' },
  { expression: Expression.lte, name: 'lte', help: 'help' },
  { expression: Expression.neq, name: 'neq', help: 'help' },
  { expression: Expression.as, name: 'as', help: 'help' },
];

export const mathFunctions = [
  { text: strings.getOptionAverage(), value: 'mean' },
  { text: strings.getOptionCount(), value: 'size' },
  { text: strings.getOptionFirst(), value: 'first' },
  { text: strings.getOptionLast(), value: 'last' },
  { text: strings.getOptionMax(), value: 'max' },
  { text: strings.getOptionMedian(), value: 'median' },
  { text: strings.getOptionMin(), value: 'min' },
  { text: strings.getOptionSum(), value: 'sum' },
  { text: strings.getOptionUnique(), value: 'unique' },
];
