'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 bg-gray-50 flex items-center justify-center">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-6xl">{getFruitEmoji(product.name)}</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
            {product.category}
          </span>
        </div>
        {product.sellerName && (
          <p className="text-xs text-gray-400 mb-2">{product.sellerName}</p>
        )}
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
          </div>
          <Button
            size="sm"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}

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
