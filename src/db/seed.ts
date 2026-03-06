import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { products, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'sqlite.db'));
const db = drizzle(sqlite);

const fruitProducts = [
  {
    name: 'Red Apple',
    description: 'Crisp and sweet red apples, perfect for snacking or baking. Rich in fiber and vitamin C.',
    price: 2.99,
    image: '/images/fruits/apple.svg',
    category: 'other' as const,
    stock: 150,
    unit: 'lb',
  },
  {
    name: 'Banana',
    description: 'Ripe yellow bananas, naturally sweet and packed with potassium. Great for smoothies.',
    price: 0.99,
    image: '/images/fruits/banana.svg',
    category: 'tropical' as const,
    stock: 200,
    unit: 'lb',
  },
  {
    name: 'Orange',
    description: 'Juicy navel oranges bursting with vitamin C. Perfect for fresh juice or eating.',
    price: 3.49,
    image: '/images/fruits/orange.svg',
    category: 'citrus' as const,
    stock: 120,
    unit: 'lb',
  },
  {
    name: 'Strawberry',
    description: 'Fresh, sweet strawberries. Excellent for desserts, smoothies, or eating fresh.',
    price: 4.99,
    image: '/images/fruits/strawberry.svg',
    category: 'berries' as const,
    stock: 80,
    unit: 'pint',
  },
  {
    name: 'Mango',
    description: 'Sweet and tropical mangoes with golden flesh. A taste of paradise.',
    price: 2.49,
    image: '/images/fruits/mango.svg',
    category: 'tropical' as const,
    stock: 60,
    unit: 'each',
  },
  {
    name: 'Blueberry',
    description: 'Plump, antioxidant-rich blueberries. Perfect for breakfast or baking.',
    price: 5.99,
    image: '/images/fruits/blueberry.svg',
    category: 'berries' as const,
    stock: 70,
    unit: 'pint',
  },
  {
    name: 'Watermelon',
    description: 'Refreshing seedless watermelon. Sweet, hydrating, and perfect for summer.',
    price: 6.99,
    image: '/images/fruits/watermelon.svg',
    category: 'melons' as const,
    stock: 30,
    unit: 'each',
  },
  {
    name: 'Grapes',
    description: 'Sweet seedless green grapes. Great for snacking or adding to salads.',
    price: 3.99,
    image: '/images/fruits/grapes.svg',
    category: 'other' as const,
    stock: 90,
    unit: 'lb',
  },
  {
    name: 'Pineapple',
    description: 'Tropical golden pineapple with sweet, tangy flavor. Rich in bromelain.',
    price: 4.49,
    image: '/images/fruits/pineapple.svg',
    category: 'tropical' as const,
    stock: 40,
    unit: 'each',
  },
  {
    name: 'Lemon',
    description: 'Fresh, zesty lemons. Essential for cooking, baking, and beverages.',
    price: 0.79,
    image: '/images/fruits/lemon.svg',
    category: 'citrus' as const,
    stock: 180,
    unit: 'each',
  },
  {
    name: 'Avocado',
    description: 'Creamy Hass avocados. Perfect for guacamole, toast, or salads.',
    price: 1.99,
    image: '/images/fruits/avocado.svg',
    category: 'other' as const,
    stock: 100,
    unit: 'each',
  },
  {
    name: 'Peach',
    description: 'Juicy, fragrant peaches with sweet flesh. Great fresh or grilled.',
    price: 3.29,
    image: '/images/fruits/peach.svg',
    category: 'stone' as const,
    stock: 75,
    unit: 'lb',
  },
  {
    name: 'Kiwi',
    description: 'Tangy green kiwifruit packed with vitamin C. A refreshing treat.',
    price: 0.99,
    image: '/images/fruits/kiwi.svg',
    category: 'tropical' as const,
    stock: 110,
    unit: 'each',
  },
  {
    name: 'Cherry',
    description: 'Sweet Bing cherries, perfect for snacking or baking pies.',
    price: 7.99,
    image: '/images/fruits/cherry.svg',
    category: 'stone' as const,
    stock: 50,
    unit: 'lb',
  },
  {
    name: 'Raspberry',
    description: 'Delicate red raspberries with intense flavor. Great for desserts.',
    price: 5.49,
    image: '/images/fruits/raspberry.svg',
    category: 'berries' as const,
    stock: 45,
    unit: 'pint',
  },
];

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  sqlite.exec('DELETE FROM order_items');
  sqlite.exec('DELETE FROM orders');
  sqlite.exec('DELETE FROM products');
  sqlite.exec('DELETE FROM users');

  // Insert products
  for (const product of fruitProducts) {
    db.insert(products).values(product).run();
  }
  console.log(`Inserted ${fruitProducts.length} products`);

  // Create a demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  db.insert(users).values({
    email: 'demo@example.com',
    name: 'Demo User',
    passwordHash,
    role: 'user',
  }).run();
  console.log('Created demo user (demo@example.com / demo123)');

  // Create an admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  db.insert(users).values({
    email: 'admin@example.com',
    name: 'Admin User',
    passwordHash: adminHash,
    role: 'admin',
  }).run();
  console.log('Created admin user (admin@example.com / admin123)');

  // Create a seller user
  const sellerHash = await bcrypt.hash('seller123', 10);
  const sellerResult = db.insert(users).values({
    email: 'seller@example.com',
    name: 'Demo Seller',
    passwordHash: sellerHash,
    role: 'seller',
  }).run();
  const sellerId = Number(sellerResult.lastInsertRowid);
  console.log('Created seller user (seller@example.com / seller123)');

  // Add 2 approved products linked to the seller
  db.insert(products).values({
    name: 'Dragon Fruit',
    description: 'Exotic dragon fruit with vibrant pink skin and sweet white flesh. Rich in antioxidants.',
    price: 5.99,
    image: '/images/fruits/dragonfruit.svg',
    category: 'tropical',
    stock: 40,
    unit: 'each',
    sellerId,
    status: 'approved',
  }).run();
  db.insert(products).values({
    name: 'Passion Fruit',
    description: 'Tropical passion fruit with intense, sweet-tart flavor. Perfect for juices and desserts.',
    price: 3.49,
    image: '/images/fruits/passionfruit.svg',
    category: 'tropical',
    stock: 60,
    unit: 'each',
    sellerId,
    status: 'approved',
  }).run();
  console.log('Created 2 seller products');

  console.log('Seeding complete!');
}

seed().catch(console.error);
