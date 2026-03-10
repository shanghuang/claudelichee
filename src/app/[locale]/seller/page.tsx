'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface Stats {
  totalProducts: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalUnitsSold: number;
  totalRevenue: number;
  topProducts: { id: number; name: string; units: number; revenue: number }[];
}

export default function SellerDashboard() {
  const t = useTranslations('seller');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-gray-500">Failed to load stats.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('totalProducts')} value={stats.totalProducts} />
        <StatCard label={t('approved')} value={stats.approvedCount} color="text-green-700" />
        <StatCard label={t('pending')} value={stats.pendingCount} color="text-yellow-600" />
        <StatCard label={t('totalRevenue')} value={`$${stats.totalRevenue.toFixed(2)}`} color="text-blue-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('topProducts')}</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('noSales')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">{t('product')}</th>
                  <th className="text-right py-2 text-gray-600">{t('units')}</th>
                  <th className="text-right py-2 text-gray-600">{t('revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 text-gray-900">{p.name}</td>
                    <td className="py-2 text-right text-gray-600">{p.units}</td>
                    <td className="py-2 text-right text-gray-900 font-medium">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              {t('addProduct')}
            </Link>
            <Link
              href="/seller/products"
              className="inline-flex items-center justify-center px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              {t('manageProducts')}
            </Link>
            <Link
              href="/seller/orders"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('viewOrders')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
