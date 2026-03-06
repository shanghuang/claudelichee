'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface SellerProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'pending' | 'approved' | 'rejected';
  sellerName: string | null;
  sellerEmail: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminProductsPage() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch(`/api/admin/products?status=${filter}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function handleAction(productId: number, status: 'approved' | 'rejected') {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchProducts();
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('productApproval')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-green-700 text-white'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('pending')}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-green-700 text-white'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('allSellerProducts')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          {t('noProducts')}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('products')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('seller')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('price')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('category')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('stock')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{product.sellerName ?? 'N/A'}</div>
                    <div className="text-xs text-gray-400">{product.sellerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{product.category}</td>
                  <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(product.id, 'approved')}
                          disabled={actionLoading === product.id}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => handleAction(product.id, 'rejected')}
                          disabled={actionLoading === product.id}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {t('reject')}
                        </button>
                      </div>
                    )}
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
