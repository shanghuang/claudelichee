import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['user', 'admin', 'seller'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  image: text('image').notNull(),
  category: text('category', { enum: ['tropical', 'citrus', 'berries', 'melons', 'stone', 'other'] }).notNull(),
  stock: integer('stock').notNull().default(100),
  unit: text('unit').notNull().default('lb'),
  sellerId: integer('seller_id').references(() => users.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('approved'),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }).notNull().default('pending'),
  total: real('total').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const productTimeline = sqliteTable('product_timeline', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sellerFollows = sqliteTable('seller_follows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  buyerId: integer('buyer_id').notNull().references(() => users.id),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
});
