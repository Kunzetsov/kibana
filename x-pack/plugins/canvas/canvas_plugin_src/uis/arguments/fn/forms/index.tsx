/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Expression } from '../config';
import { MathForm } from './math_form';
import { GetCellForm } from './get_cell_form';
import { AsForm } from './as_form';
import { EqForm } from './eq_form';
import { GtForm } from './gt_form';
import { GteForm } from './gte_form';
import { LtForm } from './lt_form';
import { LteForm } from './lte_form';
import { NeqForm } from './neq_form';
import { AnyForm } from './any_form';
import { AllForm } from './all_form';

export const forms = {
  [Expression.math]: MathForm,
  [Expression.getCell]: GetCellForm,
  [Expression.all]: AllForm,
  [Expression.any]: AnyForm,
  [Expression.eq]: EqForm,
  [Expression.gte]: GteForm,
  [Expression.gt]: GtForm,
  [Expression.lte]: LteForm,
  [Expression.lt]: LtForm,
  [Expression.neq]: NeqForm,
  [Expression.as]: AsForm,
};
