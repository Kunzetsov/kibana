/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AlertTypeParams, FindResult } from '../../../../../alerting/server';
import { NOTIFICATIONS_ID } from '../../../../common/constants';
import { FindNotificationParams } from './types';

export const getFilter = (filter: string | null | undefined) => {
  if (filter == null) {
    return `alert.attributes.alertTypeId: ${NOTIFICATIONS_ID}`;
  } else {
    return `alert.attributes.alertTypeId: ${NOTIFICATIONS_ID} AND ${filter}`;
  }
};

export const findNotifications = async ({
  rulesClient,
  perPage,
  page,
  fields,
  filter,
  sortField,
  sortOrder,
}: FindNotificationParams): Promise<FindResult<AlertTypeParams>> =>
  rulesClient.find({
    options: {
      fields,
      page,
      perPage,
      filter: getFilter(filter),
      sortOrder,
      sortField,
    },
  });
