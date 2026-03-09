'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

interface HistoryItem {
  productId: number;
  productName: string | null;
  productImage: string | null;
  productCategory: string | null;
  productStatus: string | null;
  sellerId: number | null;
  sellerName: string | null;
  totalQuantity: number;
  lastOrderedAt: string | null;
  timesOrdered: number;
}

export default function HistoryPage() {
  const t = useTranslations('history');
  const { data: session, status } = useSession();
  const { addItem } = useCart();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/history')
        .then(r => r.json())
        .then(data => { setItems(data); setLoading(false); });
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view history</h1>
        <Link href="/auth/login" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500 mb-6">{t('noHistory')}</p>
          <Link href="/products">
            <Button>{t('startShopping')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const available = item.productStatus === 'approved';
            return (
              <div key={item.productId} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName || ''} fill className="object-cover" />
                  ) : (
                    <span className="text-3xl">🍏</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-green-600 truncate block">
                    {item.productName}
                  </Link>
                  {item.sellerName && item.sellerId && (
                    <Link href={`/products?sellerId=${item.sellerId}`} className="text-sm text-gray-400 hover:text-green-600">
                      {t('soldBy')}: {item.sellerName}
                    </Link>
                  )}
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {item.lastOrderedAt && (
                      <span>{t('lastOrdered')}: {formatDate(new Date(item.lastOrderedAt))}</span>
                    )}
                    <span>{item.timesOrdered} {t('timesOrdered')}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {available ? (
                    <Link href={`/products/${item.productId}`}>
                      <Button size="sm">{t('buyAgain')}</Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                      {t('unavailable')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
