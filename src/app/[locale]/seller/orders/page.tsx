'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface SellerOrder {
  id: number;
  buyerName: string | null;
  buyerEmail: string | null;
  status: string;
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function SellerOrdersPage() {
  const t = useTranslations('seller');
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('ordersTitle')}</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          {t('noOrders')}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{t('orderId')} #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {order.buyerName ?? 'Unknown'} &bull; {order.buyerEmail}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {t('subtotal')} ${order.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-600">{t('product')}</th>
                    <th className="text-right py-2 text-gray-600">{t('qty')}</th>
                    <th className="text-right py-2 text-gray-600">{t('price2')}</th>
                    <th className="text-right py-2 text-gray-600">{t('itemTotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.productId} className="border-b last:border-0">
                      <td className="py-2 text-gray-900">{item.productName}</td>
                      <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">${item.price.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-900">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
