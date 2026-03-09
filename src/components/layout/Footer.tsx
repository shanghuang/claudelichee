'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍒</span>
              <span className="text-xl font-bold text-green-600">Lichee</span>
            </div>
            <p className="text-gray-600 text-sm">
              {t('brandDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-green-600">
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=tropical" className="text-gray-600 hover:text-green-600">
                  {t('tropical')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=berries" className="text-gray-600 hover:text-green-600">
                  {t('berries')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=citrus" className="text-gray-600 hover:text-green-600">
                  {t('citrus')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">{t('contact')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>{t('email')}</li>
              <li>{t('phone')}</li>
              <li>{t('hours')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
