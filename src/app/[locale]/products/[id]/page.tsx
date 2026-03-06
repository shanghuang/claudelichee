'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

function getFruitEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    'Red Apple': '🍎',
    'Banana': '🍌',
    'Orange': '🍊',
    'Strawberry': '🍓',
    'Mango': '🥭',
    'Blueberry': '🫐',
    'Watermelon': '🍉',
    'Grapes': '🍇',
    'Pineapple': '🍍',
    'Lemon': '🍋',
    'Avocado': '🥑',
    'Peach': '🍑',
    'Kiwi': '🥝',
    'Cherry': '🍒',
    'Raspberry': '🫐',
  };
  return emojiMap[name] || '🍏';
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('productDetail');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product not found
        </h1>
        <Link href="/products" className="text-green-600 hover:text-green-700">
          {t('backToProducts')}
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/products"
        className="text-green-600 hover:text-green-700 mb-8 inline-block"
      >
        {t('backToProducts')}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-xl h-96 flex items-center justify-center">
          <span className="text-9xl">{getFruitEmoji(product.name)}</span>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm capitalize">
              {product.category}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          <p className="text-gray-600 mb-6 text-lg">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700 font-medium">{t('quantity')}:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span
              className={`text-sm ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.stock > 0
                ? `${product.stock} ${t('inStock')}`
                : 'Out of stock'}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {t('addToCart')} - {formatPrice(product.price * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
