import dotenv from 'dotenv';
dotenv.config();

import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import { User, Product, Category, Setting, Review } from './models/index.js';
import { buildReviews, ratingSummary } from './reviewSeed.js';

// Placeholder catalogue for the FELIZ sink store. Names/prices/taglines follow
// the approved design; real photography is added later via the admin.
// `description` is the short tagline shown on the home page range cards.
export const categories = [
  { name: 'Quartz Sinks', description: 'Premium quartz finish', sortOrder: 1 },
  { name: 'Single Bowl Sinks', description: 'Compact. Elegant. Practical.', sortOrder: 2 },
  { name: 'Double Bowl Sinks', description: 'More space for more convenience', sortOrder: 3 },
  { name: 'Colored Sinks', description: 'Style that adds a splash of color', sortOrder: 4 },
  { name: 'Undermount Sinks', description: 'Sleek. Seamless. Sophisticated.', sortOrder: 5 },
  { name: 'Accessories', description: 'Complete your sink experience', sortOrder: 6 },
];

export const products = [
  // Quartz Sinks
  {
    name: 'FELIZ Marble Quartz Sink',
    slug: 'feliz-marble-quartz-sink',
    description: 'Single bowl quartz sink with a natural marble finish. Made from 80% natural quartz for exceptional strength, with a scratch, stain and heat resistant surface that keeps its colour for years.',
    price: 22999, comparePrice: 27999,
    category: 'Quartz Sinks', brand: 'FELIZ', stock: 24,
    images: [], featured: true, ratings: 4.5, numReviews: 46,
  },
  {
    name: 'FELIZ Fusion Quartz Sink',
    slug: 'feliz-fusion-quartz-sink',
    description: 'Single bowl quartz sink with a fine-grain fusion texture. Non-porous surface resists bacteria and everyday staining, and the sound-dampened base keeps washing up quiet.',
    price: 19999, comparePrice: 24999,
    category: 'Quartz Sinks', brand: 'FELIZ', stock: 30,
    images: [], featured: true, ratings: 4.4, numReviews: 32,
  },
  {
    name: 'FELIZ Granite Composite Sink',
    slug: 'feliz-granite-composite-sink',
    description: 'Naturally tough granite composite sink built to shrug off heat and impact. Deep bowl with a rear-set drain so pans sit flat and water clears fast.',
    price: 21499, comparePrice: 25999,
    category: 'Quartz Sinks', brand: 'FELIZ', stock: 18,
    images: [], featured: false, ratings: 4.6, numReviews: 51,
  },

  // Single Bowl Sinks
  {
    name: 'FELIZ Imperial Quartz Sink',
    slug: 'feliz-imperial-quartz-sink',
    description: 'Generous single bowl sink for busy kitchens. Fits full-size trays and stockpots, with a gently sloped base for effortless drainage and cleaning.',
    price: 26999, comparePrice: 31999,
    category: 'Single Bowl Sinks', brand: 'FELIZ', stock: 15,
    images: [], featured: true, ratings: 4.7, numReviews: 36,
  },
  {
    name: 'FELIZ Crystal Grey Sink',
    slug: 'feliz-crystal-grey-sink',
    description: 'Compact single bowl sink in a soft crystal grey. Ideal for smaller kitchens and utility spaces without giving up depth or durability.',
    price: 18999, comparePrice: 22999,
    category: 'Single Bowl Sinks', brand: 'FELIZ', stock: 40,
    images: [], featured: true, ratings: 4.3, numReviews: 30,
  },

  // Double Bowl Sinks
  {
    name: 'FELIZ Matrix Quartz Sink',
    slug: 'feliz-matrix-quartz-sink',
    description: 'Double bowl quartz sink that keeps washing and rinsing separate. Equal-depth bowls with a slim central divider to maximise usable space.',
    price: 24999, comparePrice: 29999,
    category: 'Double Bowl Sinks', brand: 'FELIZ', stock: 20,
    images: [], featured: true, ratings: 4.5, numReviews: 28,
  },
  {
    name: 'FELIZ Nano Black Sink',
    slug: 'feliz-nano-black-sink',
    description: 'Double bowl sink with a nano-coated black finish that repels water spots and fingerprints. A modern centrepiece that stays looking new with minimal effort.',
    price: 26999, comparePrice: 32999,
    category: 'Double Bowl Sinks', brand: 'FELIZ', stock: 12,
    images: [], featured: true, ratings: 4.8, numReviews: 20,
  },

  // Colored Sinks
  {
    name: 'FELIZ Sandstone Colored Sink',
    slug: 'feliz-sandstone-colored-sink',
    description: 'Warm sandstone finish that pairs with wood and stone worktops. Colour runs right through the material, so scratches never show a different shade underneath.',
    price: 23499, comparePrice: 28999,
    category: 'Colored Sinks', brand: 'FELIZ', stock: 22,
    images: [], featured: false, ratings: 4.4, numReviews: 19,
  },
  {
    name: 'FELIZ Ivory Colored Sink',
    slug: 'feliz-ivory-colored-sink',
    description: 'Soft ivory sink that brightens darker kitchens. UV-stable pigment keeps the tone even over years of daily use.',
    price: 20999, comparePrice: 25499,
    category: 'Colored Sinks', brand: 'FELIZ', stock: 26,
    images: [], featured: false, ratings: 4.2, numReviews: 24,
  },

  // Undermount Sinks
  {
    name: 'FELIZ Onyx Undermount Sink',
    slug: 'feliz-onyx-undermount-sink',
    description: 'Seamless undermount fit with no rim to trap crumbs — wipe straight from the worktop into the bowl. Deep onyx finish with a matte touch.',
    price: 27999, comparePrice: 33999,
    category: 'Undermount Sinks', brand: 'FELIZ', stock: 14,
    images: [], featured: true, ratings: 4.7, numReviews: 41,
  },
  {
    name: 'FELIZ Slate Undermount Sink',
    slug: 'feliz-slate-undermount-sink',
    description: 'Understated slate undermount sink with a wide flat base. Sits flush beneath quartz or granite worktops for a built-in look.',
    price: 25499, comparePrice: 30999,
    category: 'Undermount Sinks', brand: 'FELIZ', stock: 17,
    images: [], featured: false, ratings: 4.5, numReviews: 33,
  },

  // Accessories
  {
    name: 'FELIZ Sink Drain Kit',
    slug: 'feliz-sink-drain-kit',
    description: 'Complete drain and waste kit with a stainless basket strainer and anti-odour trap. Fits all FELIZ single and double bowl sinks.',
    price: 2499, comparePrice: 3499,
    category: 'Accessories', brand: 'FELIZ', stock: 120,
    images: [], featured: false, ratings: 4.3, numReviews: 87,
  },
  {
    name: 'FELIZ Roll-Up Drying Rack',
    slug: 'feliz-roll-up-drying-rack',
    description: 'Silicone-wrapped stainless rack that rolls out over the bowl for drying and rolls away when you are done. Heat resistant enough to rest hot pans on.',
    price: 1999, comparePrice: 2999,
    category: 'Accessories', brand: 'FELIZ', stock: 95,
    images: [], featured: true, ratings: 4.6, numReviews: 64,
  },
  {
    name: 'FELIZ Chopping Board',
    slug: 'feliz-chopping-board',
    description: 'Solid bamboo board sized to slide across the sink, turning the bowl into extra prep space. Reversible with a juice groove on one face.',
    price: 2999, comparePrice: 3999,
    category: 'Accessories', brand: 'FELIZ', stock: 70,
    images: [], featured: false, ratings: 4.5, numReviews: 52,
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    await User.create({
      name: 'Admin',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
    });

    await Product.bulkCreate(products);
    await Category.bulkCreate(categories.map((c) => ({ ...c, active: true })));

    // Seed marketing reviews and recompute each product's rating/count from them
    // (overwrites the placeholder ratings/numReviews above with real numbers).
    const createdProducts = await Product.findAll({ attributes: ['id'] });
    const reviews = buildReviews(createdProducts);
    await Review.bulkCreate(reviews);
    for (const p of createdProducts) {
      const own = reviews.filter((r) => r.productId === p.id);
      await Product.update(ratingSummary(own), { where: { id: p.id } });
    }

    // Announcement bar messages (editable later in Admin → Settings).
    await Setting.upsert({
      key: 'announcements',
      value: JSON.stringify(['New arrivals live now', 'Free shipping all over India', 'Easy 7-day returns']),
    });

    // "Built For Excellence" cards (editable later in Admin → Settings → Theme).
    await Setting.upsert({
      key: 'excellence',
      value: JSON.stringify([
        { title: 'Premium Quality', subtitle: 'Crafted with high grade materials', icon: 'shield' },
        { title: '10 Year Warranty', subtitle: 'Long lasting performance you can trust', icon: 'badge' },
        { title: 'Heat & Scratch Resistant', subtitle: 'Built to withstand everyday use', icon: 'flame' },
        { title: 'Free Shipping', subtitle: 'Across india on all orders', icon: 'truck' },
        { title: 'Easy Returns', subtitle: 'Hassle free returns within 7 days', icon: 'returns' },
      ]),
    });

    // Mid-page sections (editable later in Admin → Settings → Theme). Each is a
    // left text card plus up to 3 image cards; images are empty here so they show
    // the frosted placeholder until real photography is uploaded.
    await Setting.upsert({
      key: 'mid-banners',
      value: JSON.stringify([
        {
          title: 'Designed For Modern Kitchens',
          subtitle: 'FELIZ sinks are where innovation meets style. Made with advanced quartz technology and crafted for durability, they bring elegance and functionality to your everyday kitchen life.',
          cards: [
            { image: '', mobileImage: '', title: 'Performance That Lasts', subtitle: 'Built for daily use with superior strength and durability.' },
            { image: '', mobileImage: '', title: 'Elegance In Every Detail', subtitle: "Modern designs that elevate your kitchen's look." },
            { image: '', mobileImage: '', title: 'Easy To Clean', subtitle: 'Smooth surfaces for effortless cleaning and hygiene.' },
          ],
        },
        {
          title: 'Superior Materials. Timeless Quality.',
          subtitle: '',
          cards: [
            { image: '', mobileImage: '', title: 'Quartz', subtitle: 'Strong. Durable. Beautiful.' },
            { image: '', mobileImage: '', title: 'Granite', subtitle: 'Naturally Tough. Heat Resistant.' },
            { image: '', mobileImage: '', title: 'Ceramic', subtitle: 'Glossier Finish. Easy to Clean.' },
          ],
        },
      ]),
    });

    console.log(`Database seeded with ${products.length} products and ${categories.length} categories!`);
    console.log('Admin: admin@store.com / admin123');
    console.log('Customer: john@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

// Only self-run when executed directly (`npm run seed`). Importing this file
// elsewhere just exposes the catalogue above — it must never drop tables as a
// side effect of an import.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
