'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Product } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface TimelineEntry {
  id: number;
  content: string;
  image: string | null;
  createdAt: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('productDetail');
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch('/api/products');
      const products = await res.json();
      const found = products.find((p: Product) => p.id === parseInt(id));
      setProduct(found || null);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    fetch(`/api/products/${id}/timeline`)
      .then(r => r.json())
      .then(setTimeline);
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product!);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    setPosting(true);
    const formData = new FormData();
    formData.append('content', newUpdate);
    if (imageFile) formData.append('image', imageFile);
    const res = await fetch(`/api/products/${id}/timeline`, { method: 'POST', body: formData });
    if (res.ok) {
      const entry = await res.json();
      setTimeline(prev => [entry, ...prev]);
      setNewUpdate('');
      setImageFile(null);
      setImagePreview(null);
    }
    setPosting(false);
  };

  const isSeller = session?.user?.id && product?.sellerId === parseInt(session.user.id);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-xl" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link href="/products" className="text-green-600 hover:text-green-700">
          {t('backToProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/products" className="text-green-600 hover:text-green-700 mb-8 inline-block">
        {t('backToProducts')}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-xl h-96 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover rounded-xl" />
          ) : (
            <span className="text-9xl">🍏</span>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-white-900">{product.name}</h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm capitalize">
              {product.category}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-green-600">{formatPrice(product.price)}</span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          <p className="text-gray-600 mb-6 text-lg">{product.description}</p>

          {product.sellerName && product.sellerId && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">{t('soldBy')}:</span>
              <Link href={`/products?sellerId=${product.sellerId}`} className="text-sm font-medium text-green-600 hover:text-green-700">
                {product.sellerName}
              </Link>
              <span className="text-gray-300">·</span>
              <Link href={`/products?sellerId=${product.sellerId}`} className="text-xs text-gray-400 hover:text-green-600">
                {t('viewSellerProducts')} →
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700 font-medium">{t('quantity')}:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} ${t('inStock')}` : 'Out of stock'}
            </span>
          </div>

          <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart} disabled={product.stock === 0}>
            {t('addToCart')} - {formatPrice(product.price * quantity)}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('timeline')}</h2>

        {/* Post form — seller only */}
        {isSeller && (
          <div className="bg-white border rounded-xl p-4 mb-6">
            <textarea
              value={newUpdate}
              onChange={e => setNewUpdate(e.target.value)}
              placeholder={t('updatePlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
            />
            {/* Image preview */}
            {imagePreview && (
              <div className="relative w-32 h-32 mb-3">
                <Image src={imagePreview} alt="preview" fill className="object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer text-sm text-gray-500 hover:text-green-600 flex items-center gap-1">
                <span>📷</span>
                <span>{t('addPhoto')}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <Button size="sm" onClick={handlePostUpdate} disabled={posting || !newUpdate.trim()}>
                {posting ? t('posting') : t('postUpdate')}
              </Button>
            </div>
          </div>
        )}

        {/* Entries */}
        {timeline.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('timelineEmpty')}</p>
        ) : (
          <div className="relative border-l-2 border-green-100 ml-3 space-y-6">
            {timeline.map(entry => (
              <div key={entry.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                <p className="text-xs text-gray-400 mb-1">
                  {formatDate(new Date(entry.createdAt))}
                </p>
                <p className="text-gray-700 text-sm mb-2">{entry.content}</p>
                {entry.image && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                    <Image src={entry.image} alt="update" fill className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
