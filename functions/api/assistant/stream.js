import { pagesChat } from '../../../server/pagesAdapter.mjs';
export const onRequestPost = context => pagesChat(context, true);
