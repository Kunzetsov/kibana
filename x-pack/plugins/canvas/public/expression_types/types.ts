/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  Datasource as DatasourceClass,
  Transform as TransformClass,
  Model as ModelClass,
  View as ViewClass,
  Arg as ArgClass,
  BaseForm as BaseFormClass,
  // @ts-expect-error unconverted class
} from './';

export type Datasource = typeof DatasourceClass;
export type Transform = typeof TransformClass;
export type Model = typeof ModelClass;
export type View = typeof ViewClass;
export type Arg = typeof ArgClass;
export type ArgType = 'view' | 'model' | 'transform' | 'datasource';

export type ArgTypeDef = typeof BaseFormClass;
