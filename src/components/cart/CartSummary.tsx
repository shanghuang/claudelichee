'use client';

import { Link } from '@/i18n/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function CartSummary() {
  const { total, itemCount } = useCart();
  const shipping = total > 50 ? 0 : 5.99;
  const grandTotal = total + shipping;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-medium">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            Free shipping on orders over $50
          </p>
        )}
        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-lg text-green-600">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>
      <Link href="/checkout" className="block mt-6">
        <Button className="w-full" size="lg" disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
      </Link>
      <Link
        href="/products"
        className="block text-center text-sm text-green-600 hover:text-green-700 mt-4"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
