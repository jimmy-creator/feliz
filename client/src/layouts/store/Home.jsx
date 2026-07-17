import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ShieldCheck, BadgeCheck, Flame, Truck, RotateCcw, Headset,
  Play, ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, CreditCard,
} from 'lucide-react';
import api from '../../api/axios';
import SEO from '../../components/SEO';
import ProductImage from '../../components/ProductImage';
import { localizedName } from '../../utils/i18nHelpers';
import { CurrencySymbol, formatPrice } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { excellenceIcon } from '@/lib/excellenceIcons';

// ── Static content, transcribed from the approved design ──────────────────

// Fallback for the "Built For Excellence" cards, shown until an admin saves any
// in Admin → Settings → Excellence Cards. Same shape as the stored setting
// ({ title, subtitle, icon }) so one render path handles both.
const EXCELLENCE_FALLBACK = [
  { icon: 'shield', title: 'Premium Quality', subtitle: 'Crafted with high grade materials' },
  { icon: 'badge', title: '10 Year Warranty', subtitle: 'Long lasting performance you can trust' },
  { icon: 'flame', title: 'Heat & Scratch Resistant', subtitle: 'Built to withstand everyday use' },
  { icon: 'truck', title: 'Free Shipping', subtitle: 'Across india on all orders' },
  { icon: 'returns', title: 'Easy Returns', subtitle: 'Hassle free returns within 7 days' },
];

const HERO_FEATURES = [
  { icon: ShieldCheck, title: 'Premium Quality', desc: 'High Grade Materials' },
  { icon: BadgeCheck, title: '10 Year Warranty', desc: 'Long Lasting Performance' },
  { icon: Flame, title: 'Heat & Scratch Resistant', desc: 'Built For Daily Use.' },
  { icon: Truck, title: 'Free Shipping', desc: 'Across India' },
  { icon: Headset, title: 'Dedicated Support', desc: '24/7 Customer Support' },
];

const ABOUT_CARDS = [
  { title: 'Performance That Lasts', desc: 'Built for daily use with superior strength and durability.' },
  { title: 'Elegance In Every Detail', desc: "Modern designs that elevate your kitchen's look." },
  { title: 'Easy To Clean', desc: 'Smooth surfaces for effortless cleaning and hygiene.' },
];

const MATERIALS = [
  { title: 'Quartz', desc: 'Strong. Durable. Beautiful.' },
  { title: 'Granite', desc: 'Naturally Tough. Heat Resistant.' },
  { title: 'Ceramic', desc: 'Glossier Finish. Easy to Clean.' },
];

const TESTIMONIALS = [
  { name: 'Rohit Sharma', quote: '"Amazing quality and build. FELIZ sinks totally upgraded my kitchen!"' },
  { name: 'Priya Nair', quote: '"Elegant design and super durable. Highly recommended!"' },
  { name: 'Anjali Desai', quote: '"The finish is premium and it looks stunning in my kitchen."' },
];

const TRUST_BAR = [
  { icon: Truck, title: 'Free Shipping', desc: 'Across india' },
  { icon: CreditCard, title: 'Safe Payments', desc: '100% Secure' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7 Days Return' },
  { icon: Headset, title: 'Dedicated Support', desc: '24/7 Customer Support' },
];

// ── Building blocks ───────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, to, viewAllLabel = 'View All Sinks', centered = false }) {
  return (
    <div className={cn('mb-5', centered ? 'text-center' : 'flex items-end justify-between gap-4')}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={cn('display-head mt-0.5 text-2xl sm:text-[28px]', centered && 'inline-block border-b-[3px] border-[color:var(--copper)] pb-1')}>
          {title}
        </h2>
      </div>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/70 transition-colors hover:text-[color:var(--copper)]"
        >
          {viewAllLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/* Image slot — real product/lifestyle photography isn't available yet, so this
   renders whatever the product has and falls back to a neutral frosted panel at
   the right aspect ratio. Swap in real assets without touching layout. */
function ImageSlot({ src, alt, className, children }) {
  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-white/70 to-[color:var(--bg-warm)]', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="font-[var(--font-display)] text-xs uppercase tracking-[0.2em] text-foreground/25">
            {alt}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

function Stars({ rating = 5 }) {
  return (
    <span className="flex items-center gap-[1px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('size-3', i < Math.round(rating) ? 'fill-[color:var(--copper)] text-[color:var(--copper)]' : 'text-foreground/20')}
        />
      ))}
    </span>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────

function FeatureStrip() {
  return (
    <div className="glass-card mt-4 grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl px-5 py-4 sm:grid-cols-3 lg:grid-cols-5">
      {HERO_FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/15">
              <Icon className="size-[15px]" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">{feature.title}</p>
              <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Fallback hero, shown until an admin configures a banner in
   Admin → Settings → Home Banners. */
function StaticHero() {
  return (
    <div className="glass relative overflow-hidden rounded-[26px] px-6 py-10 sm:px-10 lg:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="relative z-10 max-w-md">
          <p className="eyebrow">Premium Quality. Perfectly Designed.</p>
          <h1 className="display-head mt-2 text-[44px] leading-[0.92] sm:text-[58px]">
            Perfect Sinks
          </h1>
          <p className="display-head mt-1.5 text-2xl font-medium sm:text-[28px]">
            For Every Kitchen
          </p>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            FELIZ kitchen sinks combine modern design, premium materials and unmatched
            durability for the perfect kitchen experience.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2.5 rounded-lg bg-[color:var(--copper)] px-6 py-3 text-[13px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-[color:var(--copper)]/25 transition-colors hover:bg-[color:var(--copper-dark)]"
          >
            Explore Sinks <ArrowRight className="size-4" />
          </Link>
        </div>

        <ImageSlot alt="FELIZ kitchen sink" className="aspect-[16/10] rounded-2xl" />
      </div>
    </div>
  );
}

/* Admin banner carousel. The image fills the panel edge-to-edge (admin supplies
   a correctly-sized image); the only overlay is the banner's own title/subtitle,
   left-aligned and vertically centred. */
function BannerHero({ banners }) {
  const [active, setActive] = useState(0);
  const autoplayRef = useRef(null);
  const touchStart = useRef(null);
  const touchDelta = useRef(0);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    autoplayRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(autoplayRef.current);
  }, [banners.length]);

  const goTo = (index) => {
    setActive(index);
    clearInterval(autoplayRef.current);
    if (banners.length > 1) {
      autoplayRef.current = setInterval(() => {
        setActive((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  };

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; touchDelta.current = 0; };
  const onTouchMove = (e) => { if (touchStart.current !== null) touchDelta.current = e.touches[0].clientX - touchStart.current; };
  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current < 0 && active < banners.length - 1) goTo(active + 1);
      else if (touchDelta.current > 0 && active > 0) goTo(active - 1);
    }
    touchStart.current = null;
    touchDelta.current = 0;
  };

  return (
    <div
      className="glass relative overflow-hidden rounded-[26px]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <Link
            key={banner.image || i}
            to={banner.link || '/products'}
            className="relative block w-full shrink-0"
          >
            <picture>
              {banner.mobileImage && <source media="(max-width: 720px)" srcSet={banner.mobileImage} />}
              <img
                src={banner.image}
                alt={banner.title || ''}
                className="aspect-[4/5] w-full object-cover sm:aspect-[16/6]"
                fetchPriority={i === 0 ? 'high' : 'auto'}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </picture>

            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-y-0 left-0 flex max-w-[62%] flex-col justify-center px-6 sm:px-12">
                {banner.subtitle && <p className="eyebrow">{banner.subtitle}</p>}
                {banner.title && (
                  <h1 className="display-head mt-2 text-3xl leading-[0.95] sm:text-[46px]">
                    {banner.title}
                  </h1>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); goTo(i); }}
              aria-label={`Banner ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full bg-foreground/25 transition-all',
                active === i ? 'w-6 bg-[color:var(--copper)]' : 'w-1.5',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Hero({ banners }) {
  return (
    <section className="mx-auto max-w-[1330px] px-3 lg:px-6">
      {banners.length > 0 ? <BannerHero banners={banners} /> : <StaticHero />}
      <FeatureStrip />
    </section>
  );
}

/* Driven by the categories admin: name, description and image all come from
   Admin → Categories. */
function ExploreRange({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      <div className="mb-5 text-center">
        <p className="eyebrow">Our Sink Collection</p>
        <h2 className="display-head mt-0.5 inline-block border-b-[3px] border-[color:var(--copper)] pb-1 text-2xl sm:text-[28px]">
          Explore Our Range
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const label = localizedName(category);
          return (
            <Link
              key={category.id || category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="glass-card group grid grid-cols-[1fr_1.1fr] items-center gap-3 overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-lg"
            >
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-foreground">{label}</h3>
                {category.description && (
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{category.description}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground transition-colors group-hover:text-[color:var(--copper)]">
                  Shop Now <ArrowRight className="size-3" />
                </span>
              </div>
              <ImageSlot src={category.image} alt={label} className="aspect-[4/3] rounded-xl" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ProductRail({ eyebrow, title, products, loading, badge = 'heart' }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const railRef = useRef(null);

  const scrollBy = (dir) => {
    railRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      <SectionHead eyebrow={eyebrow} title={title} to="/products" />

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="glass-card absolute -left-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors hover:text-[color:var(--copper)] lg:flex"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[calc(50%-0.5rem)] shrink-0 sm:w-[220px]">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="mt-3 h-3 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              ))
            : products.map((p) => {
                const wished = isInWishlist?.(p.id);
                return (
                  <article
                    key={p.id}
                    className="glass-card group relative flex w-[calc(50%-0.5rem)] shrink-0 flex-col overflow-hidden rounded-2xl p-3 transition-shadow hover:shadow-lg sm:w-[220px]"
                  >
                    {badge === 'heart' && (
                      <button
                        type="button"
                        onClick={() => toggleWishlist?.(p)}
                        aria-label="Add to wishlist"
                        className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-white/80 text-foreground/70 transition-colors hover:text-[color:var(--copper)]"
                      >
                        <Heart className={cn('size-3', wished && 'fill-[color:var(--copper)] text-[color:var(--copper)]')} />
                      </button>
                    )}

                    <Link to={`/product/${p.slug}`} className="block aspect-square overflow-hidden rounded-xl bg-white/50">
                      <ProductImage product={p} />
                    </Link>

                    <Link
                      to={`/product/${p.slug}`}
                      className="mt-3 line-clamp-2 text-[11px] font-medium leading-snug text-foreground transition-colors hover:text-[color:var(--copper)]"
                    >
                      {p.name}
                    </Link>

                    <p className="mt-1.5 text-[13px] font-bold text-foreground">
                      <CurrencySymbol />{formatPrice(p.price)}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <Stars rating={p.ratings} />
                        <span className="text-[9px] text-muted-foreground">({p.numReviews || 0})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => p.stock !== 0 && addToCart(p, 1, null)}
                        disabled={p.stock === 0}
                        aria-label="Add to cart"
                        className="text-foreground/60 transition-colors hover:text-[color:var(--copper)] disabled:opacity-40"
                      >
                        <ShoppingCart className="size-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="glass-card absolute -right-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors hover:text-[color:var(--copper)] lg:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

function BuiltForExcellence({ cards }) {
  const items = cards.length ? cards : EXCELLENCE_FALLBACK;

  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      {/* The heading sits inside the left column so the video column starts at
          the top of the row, level with the eyebrow. Keeping the heading above
          the grid made the cards share a row with the video and stretch to its
          aspect-ratio height. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex flex-col">
          <p className="eyebrow">Why Choose Feliz?</p>
          <h2 className="display-head mt-0.5 text-2xl sm:text-[28px]">Built For Excellence</h2>

          {/* Column count is fixed at 5 so fewer cards keep their width and the
              video stays on the right — they simply leave trailing columns
              empty rather than stretching to fill the row. */}
          <div className="mt-5 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item, i) => {
              const Icon = excellenceIcon(item.icon);
              return (
                <div key={`${item.title}-${i}`} className="glass-card flex flex-col items-center justify-center rounded-2xl px-3 py-6 text-center">
                  <span className="flex size-9 items-center justify-center rounded-full border border-foreground/15">
                    <Icon className="size-4" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-3 text-[10px] font-bold uppercase leading-tight tracking-wide text-foreground">{item.title}</h3>
                  {item.subtitle && (
                    <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Video card — size unchanged; it now aligns with the eyebrow. */}
        <div className="glass-card relative self-start overflow-hidden rounded-2xl">
          <ImageSlot alt="Crafted to perfection" className="aspect-[16/11]" />
          <span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="ml-0.5 size-4 fill-foreground text-foreground" />
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 text-center text-white">
            <p className="text-[11px] font-bold uppercase tracking-wide">Crafted To Perfection</p>
            <p className="mt-0.5 text-[10px] text-white/80">Designed for modern kitchens that inspire.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutFeliz() {
  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)]">
        <div className="glass-card rounded-2xl p-6">
          <p className="eyebrow">About Feliz</p>
          <h2 className="display-head mt-1 text-xl leading-tight sm:text-2xl">
            Designed For<br />Modern Kitchens
          </h2>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            FELIZ sinks are where innovation meets style. Made with advanced quartz
            technology and crafted for durability, they bring elegance and functionality
            to your everyday kitchen life.
          </p>
          <Link
            to="/about"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[color:var(--copper)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--copper-dark)]"
          >
            Know More <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ABOUT_CARDS.map(({ title, desc }) => (
            <div key={title} className="glass-card relative overflow-hidden rounded-2xl">
              <ImageSlot alt={title} className="aspect-[4/5]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wide">{title}</p>
                <p className="mt-1 text-[10px] leading-snug text-white/80">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SinkMaterials() {
  return (
    <section id="materials" className="mx-auto mt-10 max-w-[1330px] scroll-mt-28 px-3 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)]">
        <div>
          <p className="eyebrow">Sink Materials</p>
          <h2 className="display-head mt-1 text-xl leading-tight sm:text-2xl">
            Superior Materials.<br />Timeless Quality.
          </h2>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[color:var(--copper)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--copper-dark)]"
          >
            View All Materials <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MATERIALS.map(({ title, desc }) => (
            <div key={title} className="glass-card overflow-hidden rounded-2xl">
              <ImageSlot alt={title} className="aspect-[16/9]" />
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{title}</p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HappyHomes() {
  const railRef = useRef(null);
  const scrollBy = (dir) => railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      <SectionHead eyebrow="What Our Customers Say" title="Happy Homes" to="/products" viewAllLabel="View All Reviews" />

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="glass-card absolute -left-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors hover:text-[color:var(--copper)] lg:flex"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div ref={railRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TESTIMONIALS.map(({ name, quote }) => (
            <article
              key={name}
              className="glass-card flex w-[calc(100%-1rem)] shrink-0 gap-4 rounded-2xl p-5 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              <ImageSlot alt={name.split(' ')[0]} className="size-12 shrink-0 rounded-full" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-foreground">{name}</p>
                <span className="mt-1 flex"><Stars rating={5} /></span>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{quote}</p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="glass-card absolute -right-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition-colors hover:text-[color:var(--copper)] lg:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="mx-auto mt-10 max-w-[1330px] px-3 lg:px-6">
      <div className="glass grid grid-cols-2 gap-4 rounded-2xl px-6 py-4 sm:grid-cols-4">
        {TRUST_BAR.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center justify-center gap-2.5">
              <Icon className="size-4 shrink-0" strokeWidth={1.6} />
              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [excellence, setExcellence] = useState([]);
  const [loading, setLoading] = useState(true);
  // Seeded from cache so the hero doesn't flash the fallback on repeat visits.
  const [banners, setBanners] = useState(() => {
    const cached = localStorage.getItem('cached-banners');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    api.get('/settings/banners')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data.filter((b) => b.image) : [];
        setBanners(list);
        localStorage.setItem('cached-banners', JSON.stringify(list));
        list.forEach((b) => { const img = new Image(); img.src = b.image; });
      })
      .catch(() => {});

    api.get('/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    api.get('/settings/excellence')
      .then((res) => setExcellence(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    api.get('/products?featured=true&limit=10')
      .then((res) => setFeatured(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('/products?limit=10')
      .then((res) => setTopPicks(res.data.products || []))
      .catch(() => {});
  }, []);

  return (
    <div className="pb-10">
      <SEO title={t('home.seoTitle')} description={t('home.seoDescription')} />

      <Hero banners={banners} />
      <ExploreRange categories={categories} />

      <ProductRail
        eyebrow="Our Best Selling Sinks"
        title="Best Sellers"
        products={featured}
        loading={loading}
      />

      <BuiltForExcellence cards={excellence} />
      <AboutFeliz />
      <SinkMaterials />
      <HappyHomes />

      <ProductRail
        eyebrow="Shop Best Selling Sinks"
        title="Top Picks For You"
        products={topPicks}
        loading={loading}
        badge="none"
      />

      <TrustBar />
    </div>
  );
}
