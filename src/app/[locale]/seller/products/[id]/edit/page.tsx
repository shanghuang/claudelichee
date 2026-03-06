'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const categories = ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'];
const units = ['lb', 'each', 'pint', 'kg', 'oz'];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('seller');
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
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch('/api/seller/products')
      .then(res => res.json())
      .then(products => {
        const product = products.find((p: { id: number }) => p.id === parseInt(id));
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            unit: product.unit,
          });
          setCurrentImage(product.image);
        }
        setFetching(false);
      });
  }, [id]);

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

      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PATCH',
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to update product');
      } else {
        router.push('/seller/products');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const displayImage = imagePreview ?? currentImage;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/seller/products" className="text-gray-500 hover:text-gray-700">
          {t('back')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('editProductTitle')}</h1>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4">
          {t('editNotice')}
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
              {displayImage ? (
                <div className="relative w-full h-48">
                  <Image
                    src={displayImage}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {t('clickToChange')}
                    </span>
                  </div>
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
                {t('removeNewPhoto')}
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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
            {loading ? t('saving') : t('saveChanges')}
          </Button>
        </form>
      </div>
    </div>
  );
}
