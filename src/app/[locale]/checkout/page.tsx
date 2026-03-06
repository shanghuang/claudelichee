'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const shipping = total > 50 ? 0 : 5.99;
  const grandTotal = total + shipping;

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Please sign in to checkout
        </h1>
        <p className="text-gray-600 mb-8">
          You need to be signed in to complete your purchase.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {t('back')}
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async () => {
    setLoading(true);

    const shippingAddress = `${formData.name}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
          total: grandTotal,
        }),
      });

      if (res.ok) {
        clearCart();
        router.push('/orders?success=true');
      } else {
        alert('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {(['shipping', 'payment', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-green-600 text-white'
                  : i < (['shipping', 'payment', 'confirm'] as const).indexOf(step)
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className="ml-2 text-sm capitalize hidden sm:inline">
              {s === 'shipping' ? t('shipping') : s === 'payment' ? t('payment') : t('review')}
            </span>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">{t('shipping')}</h2>
              <div className="grid gap-4">
                <Input
                  label={t('fullName')}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Input
                  label={t('address')}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('city')}
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('state')}
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <Input
                  label={t('zipCode')}
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </div>
              <Button
                className="mt-6 w-full"
                onClick={() => setStep('payment')}
                disabled={!formData.name || !formData.address || !formData.city}
              >
                {t('next')}
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">{t('payment')}</h2>
              <p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded-lg">
                This is a demo. No real payment will be processed.
              </p>
              <div className="grid gap-4">
                <Input
                  label={t('cardNumber')}
                  name="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('expiry')}
                    name="expiry"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('cvv')}
                    name="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setStep('shipping')}>
                  {t('back')}
                </Button>
                <Button className="flex-1" onClick={() => setStep('confirm')}>
                  {t('review')}
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">{t('review')}</h2>
              <div className="space-y-4 mb-6">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">Shipping To:</h3>
                  <p className="text-gray-600">
                    {formData.name}
                    <br />
                    {formData.address}
                    <br />
                    {formData.city}, {formData.state} {formData.zip}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('items')}:</h3>
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-sm py-1"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('payment')}>
                  {t('back')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${t('placeOrder')} - ${formatPrice(grandTotal)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('orderSummary')}
            </h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('shipping2')}</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">{t('free')}</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">{t('total')}</span>
                <span className="font-bold text-green-600">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
