import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import { Product, Category } from './models/index.js';
import { products, categories } from './seed.js';

/*
 * Replaces ONLY the product + category catalogue.
 *
 * Unlike `npm run seed` (which runs sync({ force: true }) and drops every
 * table), this leaves Settings — the admin's banners and active theme — and the
 * user accounts intact.
 */
const reseed = async () => {
  try {
    await sequelize.authenticate();
    // Picks up new columns (e.g. Category.description) without dropping data.
    await sequelize.sync({ alter: true });

    const removedProducts = await Product.destroy({ where: {} });
    const removedCategories = await Category.destroy({ where: {} });
    console.log(`Removed ${removedProducts} products and ${removedCategories} categories.`);

    await Category.bulkCreate(categories.map((c) => ({ ...c, active: true })));
    await Product.bulkCreate(products);
    console.log(`Inserted ${categories.length} categories and ${products.length} products.`);

    process.exit(0);
  } catch (error) {
    console.error('Reseed failed:', error);
    process.exit(1);
  }
};

reseed();
