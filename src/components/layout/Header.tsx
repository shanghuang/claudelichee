'use client';

import { useCart } from '@/context/CartContext';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

const localeLabels: Record<string, string> = {
  en: 'EN',
  'zh-TW': '繁中',
  ja: '日本語',
};

export default function Header() {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || 'en';

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLocaleMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍒</span>
              <span className="text-xl font-bold text-green-600">Lichee</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              {t('products')}
            </Link>
            {session ? (
              <>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {t('orders')}
                </Link>
                <Link
                  href="/history"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {t('history')}
                </Link>
                <Link
                  href="/feed"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {t('feed')}
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-green-700 font-semibold hover:text-green-900 transition-colors"
                  >
                    {t('admin')}
                  </Link>
                )}
                {session.user?.role === 'seller' && (
                  <Link
                    href="/seller"
                    className="text-green-700 font-semibold hover:text-green-900 transition-colors"
                  >
                    {t('seller')}
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {t('signOut')}
                </button>
                <span className="text-sm text-gray-500">
                  {session.user?.name}
                </span>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                {t('signIn')}
              </Link>
            )}

            {/* Locale Switcher */}
            <div className="relative">
              <button
                onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 border border-gray-200 rounded-lg px-2 py-1 transition-colors"
              >
                {localeLabels[currentLocale] || currentLocale}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {localeMenuOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {Object.entries(localeLabels).map(([locale, label]) => (
                    <button
                      key={locale}
                      onClick={() => handleLocaleChange(locale)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors ${
                        currentLocale === locale ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/cart"
              className="relative text-gray-600 hover:text-green-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="relative text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/products"
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('products')}
              </Link>
              {session ? (
                <>
                  <Link
                    href="/orders"
                    className="text-gray-600 hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('orders')}
                  </Link>
                  <Link
                    href="/history"
                    className="text-gray-600 hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('history')}
                  </Link>
                  <Link
                    href="/feed"
                    className="text-gray-600 hover:text-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('feed')}
                  </Link>
                  {session.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-green-700 font-semibold hover:text-green-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('admin')}
                    </Link>
                  )}
                  {session.user?.role === 'seller' && (
                    <Link
                      href="/seller"
                      className="text-green-700 font-semibold hover:text-green-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('seller')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-green-600"
                  >
                    {t('signOut')} ({session.user?.name})
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('signIn')}
                </Link>
              )}

              {/* Mobile Locale Switcher */}
              <div className="flex gap-2 pt-2 border-t">
                {Object.entries(localeLabels).map(([locale, label]) => (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`text-sm px-3 py-1 rounded-lg border transition-colors ${
                      currentLocale === locale
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
