import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match root path and all locale-prefixed paths
  matcher: ['/', '/(ar|fr|en)/:path*']
};
