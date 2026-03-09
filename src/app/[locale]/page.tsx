import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { db } from '@/db';
import { products, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import ProductGrid from '@/components/products/ProductGrid';
import Button from '@/components/ui/Button';

const CATEGORY_SLUGS = ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'] as const;

export default async function Home() {
  const t = await getTranslations('home');
  const tp = await getTranslations('products');

  type CategorySlug = typeof CATEGORY_SLUGS[number];
  const categoryKeyMap: Record<CategorySlug, Parameters<typeof tp>[0]> = {
    tropical: 'categoryTropical',
    citrus: 'categoryCitrus',
    berries: 'categoryBerries',
    melons: 'categoryMelons',
    stone: 'categoryStone',
    other: 'categoryOther',
  };

  const categoryData = CATEGORY_SLUGS.map(slug => ({
    slug,
    name: tp(categoryKeyMap[slug]),
    items: db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        category: products.category,
        stock: products.stock,
        unit: products.unit,
        sellerId: products.sellerId,
        sellerName: users.name,
        status: products.status,
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(and(eq(products.status, 'approved'), eq(products.category, slug)))
      .limit(4).all(),
  })).filter(c => c.items.length > 0);

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
                  {t('viewCategories')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories with Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
            {t('shopByCategory')}
          </h2>
          <div className="space-y-12">
            {categoryData.map(({ slug, name, items }) => (
              <div key={slug}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                  <Link
                    href={`/products?category=${slug}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t('viewAll')}
                  </Link>
                </div>
                <ProductGrid products={items} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
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
