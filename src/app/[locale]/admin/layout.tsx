import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations('admin');

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-green-700 text-white flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🍒</span>
            <span className="text-lg font-bold">{t('dashboard')}</span>
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              {t('users')}
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              {t('products')}
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium mt-4 text-green-200"
            >
              {t('backToStore')}
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
