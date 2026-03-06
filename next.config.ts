import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  images: {
    localPatterns: [{ pathname: '/images/**' }],
  },
};

export default withNextIntl(nextConfig);
