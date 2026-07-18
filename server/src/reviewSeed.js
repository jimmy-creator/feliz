// Seed/marketing reviews for the FELIZ sink catalogue. These are admin-created
// (no user account) and pre-approved. Shared by seed.js and the one-off live
// insert so both stay in sync. Ratings are mostly 4–5 so product averages land
// in a realistic ~4.5 range.

const NAMES = [
  'Rohit Sharma', 'Priya Nair', 'Anjali Desai', 'Vikram Iyer', 'Sneha Reddy',
  'Arjun Menon', 'Kavya Pillai', 'Rahul Verma', 'Meera Krishnan', 'Aditya Rao',
  'Divya Suresh', 'Karthik Nair', 'Pooja Shetty', 'Sandeep Kumar',
];

const TEMPLATES = [
  { rating: 5, title: 'Excellent build quality', comment: 'Amazing quality and build. This sink totally upgraded my kitchen!' },
  { rating: 5, title: 'Looks premium', comment: 'Elegant design and super durable. The finish looks stunning in my kitchen.' },
  { rating: 5, title: 'Worth every rupee', comment: 'Premium feel and rock solid. Installation was smooth and it fits perfectly.' },
  { rating: 4, title: 'Great sink', comment: 'Very sturdy and spacious. Cleans up easily and looks great after months of use.' },
  { rating: 5, title: 'Highly recommend', comment: 'Scratch and stain resistant as promised. No marks even after heavy daily use.' },
  { rating: 4, title: 'Happy with it', comment: 'Good depth and the matte finish hides water spots well. Would buy again.' },
  { rating: 5, title: 'Beautiful finish', comment: 'The colour is gorgeous and matches my countertop perfectly. Very happy!' },
  { rating: 5, title: 'Solid and quiet', comment: 'No noise when water runs and it feels really solid. Superb quality.' },
  { rating: 4, title: 'Good value', comment: 'Practical size and easy to maintain. Delivery was quick and well packed.' },
  { rating: 5, title: 'Best kitchen upgrade', comment: 'Heat resistant and heavy-duty. Easily the best sink I have owned.' },
  { rating: 4, title: 'Nicely made', comment: 'Feels durable and the drainage is excellent. A few weeks in and no complaints.' },
  { rating: 5, title: 'Love it', comment: 'Modern look, deep bowl, and effortless to clean. Exactly what I wanted.' },
  { rating: 5, title: 'Top notch', comment: 'Great craftsmanship and the surface still looks brand new. Fully satisfied.' },
  { rating: 4, title: 'Recommended', comment: 'Sturdy quartz body and a clean minimal design. Looks expensive.' },
  { rating: 5, title: 'Perfect fit', comment: 'Fit my counter cut-out perfectly and the quality is outstanding.' },
  { rating: 4, title: 'Very good', comment: 'Spacious bowl handles big utensils with ease. Solid purchase overall.' },
];

// Build a flat list of review rows for the given products (each needs `id`).
// Deterministic: 4–6 reviews per product, rotating through templates/names so
// no product repeats a template within its own set.
export function buildReviews(products) {
  const reviews = [];
  products.forEach((product, pi) => {
    const count = 4 + (pi % 3); // 4, 5 or 6
    for (let i = 0; i < count; i++) {
      const t = TEMPLATES[(pi + i) % TEMPLATES.length];
      const name = NAMES[(pi * 2 + i) % NAMES.length];
      reviews.push({
        productId: product.id,
        userId: null,
        name,
        email: null,
        rating: t.rating,
        title: t.title,
        comment: t.comment,
        verified: i % 2 === 0,
        approved: true,
        adminCreated: true,
      });
    }
  });
  return reviews;
}

// Average rating + count for a product's review rows, matching the shape
// updateProductRating() writes ({ ratings: '4.50', numReviews: 5 }).
export function ratingSummary(reviewsForProduct) {
  const numReviews = reviewsForProduct.length;
  if (!numReviews) return { ratings: 0, numReviews: 0 };
  const avg = reviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / numReviews;
  return { ratings: avg.toFixed(2), numReviews };
}
