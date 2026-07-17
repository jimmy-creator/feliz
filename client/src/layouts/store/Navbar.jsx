import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Search, User, ShoppingCart, Home, LayoutGrid, Heart,
  ShieldCheck, BadgeCheck, Truck, PackageSearch, Headset, X,
  RotateCcw, CreditCard, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import api from '../../api/axios';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import ProductImage from '../../components/ProductImage';
import { CURRENCY, formatPrice } from '../../utils/currency';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'FELIZ';

// The utility bar's left side is driven by Admin → Settings → Announcement bar,
// which stores plain strings. Pick an icon by keyword so the design's icon+text
// pairing survives whatever the admin types (same approach the category icons
// use elsewhere). Falls back to a generic mark.
const ANNOUNCEMENT_ICONS = [
  [/warrant|guarantee/i, BadgeCheck],
  [/ship|deliver|freight/i, Truck],
  [/return|refund|exchange/i, RotateCcw],
  [/support|help|service|assist/i, Headset],
  [/secure|payment|pay|safe/i, CreditCard],
  [/quality|premium|grade|durab/i, ShieldCheck],
];

function announcementIcon(text = '') {
  for (const [re, Icon] of ANNOUNCEMENT_ICONS) if (re.test(text)) return Icon;
  return Sparkles;
}

// Main nav — exact labels from the design.
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'All Sinks' },
  { to: '/#materials', label: 'Sink Material' },
  { to: '/products?category=Accessories', label: 'Accessories' },
  { to: '/about', label: 'About Us' },
];

// Icon + label stack used by the Search / Wishlist / Cart actions. Declared at
// module scope so it isn't re-created on every Navbar render.
function ActionItem({ icon, label, count }) {
  const Icon = icon;
  return (
    <span className="relative flex flex-col items-center gap-0.5">
      <span className="relative">
        <Icon className="size-[18px]" strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[color:var(--copper)] px-1 text-[9px] font-bold leading-none text-white">
            {count}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </span>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  // Seeded from cache so the bar doesn't pop in on repeat visits.
  const [announcements, setAnnouncements] = useState(() => {
    const cached = localStorage.getItem('cached-announcements');
    return cached ? JSON.parse(cached) : [];
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});

    api.get('/settings/announcements')
      .then((res) => {
        if (!Array.isArray(res.data)) return;
        setAnnouncements(res.data);
        localStorage.setItem('cached-announcements', JSON.stringify(res.data));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('[data-search]')) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Search autocomplete (debounced)
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search-suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const pickSuggestion = (product) => {
    setShowSuggestions(false);
    setShowSearch(false);
    setQuery('');
    navigate(`/product/${product.slug}`);
    setShowMobileMenu(false);
  };

  const onSearchKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setShowSuggestions(false);
    }
  };

  const scrollTopIfHome = () => {
    if (location.pathname === '/' || location.pathname === '/ar') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    navigate(`/products?${params.toString()}`);
    setShowSuggestions(false);
    setShowSearch(false);
    setShowMobileMenu(false);
  };

  // A nav link is active when its path matches the current route.
  const isActive = (to) => {
    const [path, search] = to.split('?');
    if (path.startsWith('/#')) return false;
    if (path === '/') return location.pathname === '/';
    if (!location.pathname.startsWith(path)) return false;
    return search ? location.search.includes(search) : true;
  };

  const searchForm = (
    <form onSubmit={handleSearch} data-search className="relative w-full">
      <div className="glass-card flex h-11 w-full items-stretch overflow-hidden rounded-full">
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search sinks, materials, accessories…"
          className="min-w-0 flex-1 bg-transparent px-5 text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex shrink-0 items-center justify-center bg-[color:var(--copper)] px-5 text-white transition-colors hover:bg-[color:var(--copper-dark)]"
        >
          <Search className="size-4" />
        </button>
      </div>

      {showSuggestions && (
        <div className="glass absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl">
          {suggestions.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                activeIndex === i ? 'bg-white/70' : 'hover:bg-white/50',
              )}
              onClick={() => pickSuggestion(p)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="size-10 shrink-0 overflow-hidden rounded-md bg-white/60">
                <ProductImage product={p} size="small" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.category} · {CURRENCY}{formatPrice(p.price)}
                </span>
              </div>
            </button>
          ))}
          <button
            type="button"
            className="block w-full border-t border-white/60 px-3 py-2.5 text-center text-sm font-semibold text-[color:var(--copper)] hover:bg-white/50"
            onClick={handleSearch}
          >
            View all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <ScrollToTopButton />

      <header className="sticky top-0 z-40 w-full">
        {/* ── Utility bar ─────────────────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-[1330px] items-center justify-between gap-6 px-6 py-2.5 text-[11px] text-foreground/70">
            {/* Left: admin announcements. Overflow is clipped rather than
                wrapping, so a long list can't push the links off the bar. */}
            <div className="flex min-w-0 flex-1 items-center gap-7 overflow-hidden">
              {announcements.map((text) => {
                const Icon = announcementIcon(text);
                return (
                  <span key={text} className="flex shrink-0 items-center gap-1.5">
                    <Icon className="size-[13px]" strokeWidth={1.8} />
                    {text}
                  </span>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-7">
              <LanguageSwitcher compact />
              <Link to="/orders" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <PackageSearch className="size-[13px]" strokeWidth={1.8} /> Track Order
              </Link>
              <Link to="/contact" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <Headset className="size-[13px]" strokeWidth={1.8} /> Support
              </Link>
            </div>
          </div>
        </div>

        {/* ── Glass nav panel ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1330px] px-3 pb-2 pt-2 lg:px-6 lg:pt-0">
          <nav className="glass flex h-[62px] items-center gap-3 rounded-2xl px-3 sm:px-5">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/60 lg:hidden"
              onClick={() => setShowMobileMenu(true)}
              aria-label={t('common.menu')}
            >
              <Menu className="size-5" />
            </button>

            {/* Logo */}
            <Link to="/" onClick={scrollTopIfHome} className="flex shrink-0 items-center">
              <img
                src="/images/feliz-logo.png"
                alt={STORE_NAME}
                className="h-8 w-auto sm:h-9"
                fetchPriority="high"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="ml-auto hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={to === '/' ? scrollTopIfHome : undefined}
                  className={cn(
                    'relative py-1 text-[13px] font-medium transition-colors',
                    isActive(to) ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
                  )}
                >
                  {label}
                  {isActive(to) && (
                    <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-[color:var(--copper)]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="ml-auto flex shrink-0 items-center gap-4 text-foreground lg:ml-10 lg:gap-6">
              <button
                type="button"
                onClick={() => setShowSearch((s) => !s)}
                aria-label="Search"
                aria-expanded={showSearch}
                className={cn('transition-colors hover:text-[color:var(--copper)]', showSearch && 'text-[color:var(--copper)]')}
              >
                <ActionItem icon={showSearch ? X : Search} label="Search" />
              </button>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden transition-colors hover:text-[color:var(--copper)] sm:block"
              >
                <ActionItem icon={Heart} label="Wishlist" count={wishlistCount} />
              </Link>

              <Link to="/cart" aria-label="Cart" className="transition-colors hover:text-[color:var(--copper)]">
                <ActionItem icon={ShoppingCart} label="Cart" count={cartCount} />
              </Link>

              <Link
                to={user ? '/profile' : '/login'}
                aria-label={user ? 'Account' : 'Sign in'}
                className="hidden transition-colors hover:text-[color:var(--copper)] lg:block"
              >
                <ActionItem icon={User} label={user ? 'Account' : 'Sign In'} />
              </Link>
            </div>
          </nav>

          {/* Search row */}
          {showSearch && (
            <div className="mx-auto mt-2 max-w-3xl px-1">{searchForm}</div>
          )}
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="border-b border-border-light">
            <SheetTitle>
              <img src="/images/feliz-logo.png" alt={STORE_NAME} className="h-8 w-auto" />
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col p-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setShowMobileMenu(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/60"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border-light p-2">
            {[
              { to: '/', icon: Home, label: 'Home' },
              { to: '/products', icon: LayoutGrid, label: 'All Sinks' },
              { to: '/wishlist', icon: Heart, label: 'Wishlist', count: wishlistCount },
              { to: '/cart', icon: ShoppingCart, label: 'Cart', count: cartCount },
              { to: user ? '/profile' : '/login', icon: User, label: user ? 'Account' : 'Sign In' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/60"
                >
                  <Icon className="size-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--copper)] px-1.5 text-xs font-semibold text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {categories.length > 0 && (
            <div className="border-t border-border-light p-2">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('common.categories')}
              </div>
              <div className="flex flex-col">
                {categories.map((c) => (
                  <Link
                    key={c.id || c.name}
                    to={`/products?category=${encodeURIComponent(c.name)}`}
                    onClick={() => setShowMobileMenu(false)}
                    className="rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/60"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border-light p-4">
            <LanguageSwitcher compact />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
