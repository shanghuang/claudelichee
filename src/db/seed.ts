import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { products, users } from './schema';
import bcrypt from 'bcryptjs';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'sqlite.db'));
const db = drizzle(sqlite);

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  sqlite.exec('DELETE FROM order_items');
  sqlite.exec('DELETE FROM orders');
  sqlite.exec('DELETE FROM products');
  sqlite.exec('DELETE FROM users');

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
