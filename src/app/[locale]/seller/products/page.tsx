'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface SellerProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  status: 'pending' | 'approved' | 'rejected';
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function SellerProductsPage() {
  const t = useTranslations('seller');
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/seller/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function handleDelete(productId: number) {
    if (!confirm(t('confirmDelete'))) return;
    setDeletingId(productId);
    setError('');
    try {
      const res = await fetch(`/api/seller/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete product');
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('myProducts')}</h1>
        <Link
          href="/seller/products/new"
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium text-sm"
        >
          {t('addProductBtn')}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          {t('noProducts')}{' '}
          <Link href="/seller/products/new" className="text-green-600 hover:underline">
            {t('addFirst')}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('name')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('price2')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('stock')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('category')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">${product.price.toFixed(2)} / {product.unit}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{product.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
