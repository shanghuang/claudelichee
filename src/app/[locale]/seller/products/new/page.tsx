'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const CATEGORY_SLUGS = ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'] as const;
const units = ['lb', 'each', 'pint', 'kg', 'oz'];

export default function NewProductPage() {
  const t = useTranslations('seller');
  const tp = useTranslations('products');

  type CategorySlug = typeof CATEGORY_SLUGS[number];
  const categoryKeyMap: Record<CategorySlug, Parameters<typeof tp>[0]> = {
    tropical: 'categoryTropical',
    citrus: 'categoryCitrus',
    berries: 'categoryBerries',
    melons: 'categoryMelons',
    stone: 'categoryStone',
    other: 'categoryOther',
  };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'tropical',
    stock: '',
    unit: 'lb',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('unit', formData.unit);
      if (imageFile) data.append('image', imageFile);

      const res = await fetch('/api/seller/products', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to create product');
      } else {
        router.push('/seller/products');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/seller/products" className="text-gray-500 hover:text-gray-700">
          {t('back')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('addProductTitle')}</h1>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4">
          {t('pendingNotice')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('productPhoto')}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors"
            >
              {imagePreview ? (
                <div className="relative w-full h-48">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="py-6 text-gray-400">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">{t('photoHint')}</p>
                  <p className="text-xs mt-1">{t('photoHint2')}</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="mt-1 text-xs text-red-500 hover:text-red-700"
              >
                {t('removePhoto')}
              </button>
            )}
          </div>

          <Input
            label={t('productName')}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <Input
            label={t('price')}
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORY_SLUGS.map(cat => (
                <option key={cat} value={cat}>{tp(categoryKeyMap[cat])}</option>
              ))}
            </select>
          </div>

          <Input
            label={t('stock')}
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              {t('unit')}
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('submitting') : t('submitApproval')}
          </Button>
        </form>
      </div>
    </div>
  );
}
