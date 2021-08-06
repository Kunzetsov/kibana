/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Expression } from '../config';
import { formHoc } from './form_hoc';
import { MathForm as MathFormComponent } from './math_form';

export const MathForm = formHoc(MathFormComponent);

export const forms = {
  [Expression.math]: MathForm,
  [Expression.getCell]: MathForm,
  [Expression.all]: MathForm,
  [Expression.any]: MathForm,
  [Expression.eq]: MathForm,
  [Expression.gte]: MathForm,
  [Expression.gt]: MathForm,
  [Expression.lte]: MathForm,
  [Expression.lt]: MathForm,
  [Expression.neq]: MathForm,
  [Expression.as]: MathForm,
};
