import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { db } from '@/db';
import { products } from '@/db/schema';
import ProductGrid from '@/components/products/ProductGrid';
import Button from '@/components/ui/Button';

export default async function Home() {
  const t = await getTranslations('home');
  const featuredProducts = db.select().from(products).limit(8).all();

  const categories = [
    { name: 'Tropical', slug: 'tropical', emoji: '🥭' },
    { name: 'Citrus', slug: 'citrus', emoji: '🍊' },
    { name: 'Berries', slug: 'berries', emoji: '🍓' },
    { name: 'Melons', slug: 'melons', emoji: '🍉' },
    { name: 'Stone Fruits', slug: 'stone', emoji: '🍑' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('hero')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('heroSub')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <Button size="lg">{t('shopNow')}</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg">
                  View Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <span className="text-4xl mb-2">{category.emoji}</span>
                <span className="font-medium text-gray-700 group-hover:text-green-600">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Fruits
            </h2>
            <Link
              href="/products"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('whyTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold text-lg mb-2">{t('feature2Title')}</h3>
              <p className="text-gray-600">{t('feature2Desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-semibold text-lg mb-2">{t('feature1Title')}</h3>
              <p className="text-gray-600">{t('feature1Desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="font-semibold text-lg mb-2">{t('feature3Title')}</h3>
              <p className="text-gray-600">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
