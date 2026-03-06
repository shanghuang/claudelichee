'use client';

import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
        {getFruitEmoji(product.name)}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">
          {formatPrice(product.price)} / {product.unit}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>
      <div className="text-right w-24">
        <p className="font-semibold text-green-600">
          {formatPrice(product.price * quantity)}
        </p>
      </div>
      <button
        onClick={() => removeItem(product.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
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
