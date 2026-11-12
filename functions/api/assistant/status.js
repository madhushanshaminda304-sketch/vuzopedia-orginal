import { pagesStatus } from '../../../server/pagesAdapter.mjs';
export const onRequestGet = context => pagesStatus(context);
