'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface FeedEntry {
  id: number;
  content: string;
  image: string | null;
  createdAt: number;
  productId: number;
  productName: string | null;
  sellerId: number;
  sellerName: string | null;
}

export default function FeedPage() {
  const t = useTranslations('feed');
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    fetch('/api/feed')
      .then(r => r.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">{t('notLoggedIn')}</p>
        <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('noFollows')}</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t('browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-sm">
                    {entry.sellerName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.sellerName}</p>
                    {entry.productName && (
                      <Link
                        href={`/products/${entry.productId}`}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        {entry.productName}
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDate(new Date(entry.createdAt))}
                </p>
              </div>
              <p className="text-gray-700 text-sm mb-3">{entry.content}</p>
              {entry.image && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image src={entry.image} alt="update" fill className="object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
