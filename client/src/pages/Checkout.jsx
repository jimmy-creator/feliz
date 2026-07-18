import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice, CurrencySymbol, CURRENCY } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const toastStyle = {
  style: {
    background: '#1a1614', color: '#f5f0eb',
    fontSize: '0.88rem', fontFamily: "'Outfit', sans-serif", borderRadius: '4px',
  },
  iconTheme: { primary: '#c4784a', secondary: '#f5f0eb' },
};

// Store WhatsApp number — orders are handed off here instead of an online
// payment gateway. Keep in sync with FloatingWhatsApp.jsx.
const WHATSAPP_NUMBER = '96894103737';

// The store ships within Qatar — popular cities suggested in the address combobox
// (customers can also type any city not listed).
const QATAR_CITIES = [
  'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Wukair', 'Umm Salal',
  'Al Daayen', 'Lusail', 'Mesaieed', 'Dukhan', 'Al Shamal', 'Al Shahaniya',
];

export default function Checkout() {
  const { t } = useTranslation();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const processingOrder = useRef(false);
  const isGuest = !user;

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);

  // Tax state (prices are tax-inclusive — shown for info, not added on top)
  const [taxInfo, setTaxInfo] = useState({ totalTax: 0, breakdown: null });

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    country: 'Qatar',
    phone: user?.phone || '',
  });

  // Save abandoned cart when checkout page loads
  useEffect(() => {
    const email = user?.email || form.email;
    if (email && cart.length > 0) {
      api.post('/abandoned-cart/save', {
        email,
        items: cart.map((item) => ({ name: item.name, price: parseFloat(item.price), quantity: item.quantity })),
        cartTotal,
      }).catch(() => {});
    }
  }, [cart, user]);

  useEffect(() => {
    api.get('/coupons/available')
      .then((res) => setAvailableCoupons(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAvailableCoupons([]));
  }, []);

  // Fetch tax whenever the state/city changes (prices are tax-inclusive).
  useEffect(() => {
    if (!form.state.trim()) { setTaxInfo({ totalTax: 0, breakdown: null }); return; }
    api.post('/payment/calculate-tax', {
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      shippingState: form.state,
    }).then((res) => setTaxInfo(res.data)).catch(() => {});
  }, [form.state, cart]);

  if (cart.length === 0 && !processingOrder.current) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getShippingAddress = () => ({
    fullName: form.fullName, address: form.address,
    city: form.city, state: form.state,
    country: form.country, phone: form.phone,
  });

  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride ?? couponCode).trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/apply', {
        code,
        cartTotal,
        cartCategories: [...new Set(cart.map((item) => item.category))],
        cartProductIds: cart.map((item) => item.id),
        paymentMethod: 'whatsapp',
      });
      setCouponApplied(data);
      setCouponCode(code);
      setCouponError('');
      setShowCoupons(false);
      toast.success(`Coupon applied: ${data.description}`, toastStyle);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  const discountAmount = couponApplied?.discount || 0;
  const taxAmount = taxInfo.totalTax || 0;
  const grandTotal = Math.max(0, cartTotal - discountAmount);

  // Build the WhatsApp order message: items, totals, and customer details.
  const buildWhatsAppMessage = (order) => {
    const lines = [];
    lines.push(`New order — ${order.orderNumber}`);
    lines.push('');
    lines.push('Items:');
    cart.forEach((item, i) => {
      const variant = item.selectedVariant ? ` (${Object.values(item.selectedVariant).join(', ')})` : '';
      lines.push(`${i + 1}. ${item.name}${variant} x ${item.quantity} — ${CURRENCY} ${formatPrice(parseFloat(item.price) * item.quantity)}`);
    });
    lines.push('');
    lines.push(`Subtotal: ${CURRENCY} ${formatPrice(cartTotal)}`);
    if (discountAmount > 0) {
      lines.push(`Discount${couponApplied?.code ? ` (${couponApplied.code})` : ''}: -${CURRENCY} ${formatPrice(discountAmount)}`);
    }
    lines.push(`Total: ${CURRENCY} ${formatPrice(order.totalAmount)}`);
    lines.push('');
    lines.push('Customer details:');
    lines.push(`Name: ${form.fullName}`);
    lines.push(`Phone: ${form.phone}`);
    if (form.email) lines.push(`Email: ${form.email}`);
    lines.push(`Address: ${[form.address, form.city, form.country].filter(Boolean).join(', ')}`);
    return lines.join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.city.trim()) {
      toast.error(t('checkout.cityRequired'), toastStyle);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, selectedVariant: item.selectedVariant || null })),
        shippingAddress: getShippingAddress(),
        shippingMethod: 'standard',
        paymentMethod: 'whatsapp',
        couponCode: couponApplied?.code || null,
      };

      let order;
      if (isGuest) {
        orderData.guestEmail = form.email;
        ({ data: order } = await api.post('/orders/guest', orderData));
        api.post('/abandoned-cart/recover', { email: form.email }).catch(() => {});
      } else {
        ({ data: order } = await api.post('/orders', orderData));
        api.post('/abandoned-cart/recover', { email: user.email }).catch(() => {});
      }

      // Hand the order off to WhatsApp. Mark processing so the empty-cart guard
      // doesn't redirect to /cart between clearCart() and the redirect.
      const message = buildWhatsAppMessage(order);
      processingOrder.current = true;
      clearCart();
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order', toastStyle);
      setLoading(false);
    }
  };

  const Row = ({ label, value, className }) => (
    <div className={cn('flex justify-between text-sm', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );

  // Price with the QAR currency label (text via <CurrencySymbol />).
  // nowrap keeps the label glued to the amount.
  const Money = ({ amount, sign = '' }) => (
    <span className="whitespace-nowrap">{sign}<CurrencySymbol />{formatPrice(amount)}</span>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 font-serif text-3xl font-semibold tracking-tight">{t('checkout.title')}</h1>

      {isGuest && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4" /> {t('checkout.guest')}
          </span>
          <Link to="/login" className="font-medium text-primary hover:underline">{t('checkout.guestSignIn')}</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: address */}
        <div className="flex min-w-0 flex-col gap-8">
          <section className="rounded-lg border border-border bg-card p-6">
            {isGuest && (
              <div className="mb-5 flex flex-col gap-2">
                <Label htmlFor="email">{t('checkout.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('checkout.emailPlaceholder')}
                  required
                />
              </div>
            )}

            <h3 className="mb-4 font-medium">{t('checkout.shippingAddress')}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">{t('checkout.fullName')}</Label>
                <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">{t('checkout.address', { defaultValue: 'Address' })}</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder={t('checkout.addressPlaceholder')}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">{t('checkout.city', { defaultValue: 'City' })}</Label>
                <Input
                  id="city"
                  name="city"
                  list="qatar-cities"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, state: e.target.value }))}
                  placeholder={t('checkout.cityPlaceholder')}
                  autoComplete="off"
                  required
                />
                <datalist id="qatar-cities">
                  {QATAR_CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">{t('checkout.phone')}</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="min-w-0">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-medium">{t('checkout.orderSummary')}</h3>

            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <Row
                  key={item.cartKey}
                  label={`${item.name}${item.selectedVariant ? ` (${Object.values(item.selectedVariant).join(', ')})` : ''} × ${item.quantity}`}
                  value={<Money amount={parseFloat(item.price) * item.quantity} />}
                />
              ))}
            </div>

            <Separator className="my-4" />

            {/* Coupon */}
            <div className="mb-4">
              {couponApplied ? (
                <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 p-3">
                  <div className="flex flex-col">
                    <Badge className="w-fit">{couponApplied.code}</Badge>
                    <span className="mt-1 text-xs text-muted-foreground">{couponApplied.description}</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={handleRemoveCoupon} aria-label="Remove coupon">
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder={t('cart.couponPlaceholder')}
                    />
                    <Button type="button" variant="outline" onClick={() => handleApplyCoupon()} disabled={couponLoading}>
                      {couponLoading ? '…' : t('cart.couponApply')}
                    </Button>
                  </div>
                  {availableCoupons.length > 0 && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                      onClick={() => setShowCoupons((s) => !s)}
                    >
                      {showCoupons ? t('checkout.hide') : t('checkout.view')} {availableCoupons.length} {t('checkout.availableCoupons')}
                    </button>
                  )}
                  {showCoupons && (
                    <ul className="mt-2 flex flex-col gap-2">
                      {availableCoupons.map((c) => {
                        const valueLabel = c.type === 'percentage'
                          ? <>{c.value}% {t('checkout.off')}{c.maxDiscount ? <> ({t('checkout.upTo')} <Money amount={c.maxDiscount} />)</> : ''}</>
                          : <><Money amount={c.value} /> {t('checkout.off')}</>;
                        const eligible = cartTotal >= c.minOrderAmount;
                        return (
                          <li key={c.code} className={cn('flex items-center justify-between gap-2 rounded-md border border-border p-3', !eligible && 'opacity-60')}>
                            <div className="min-w-0">
                              <Badge variant="outline" className="font-mono">{c.code}</Badge>
                              <span className="ml-2 text-sm font-medium">{valueLabel}</span>
                              {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                              {c.minOrderAmount > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {t('checkout.minOrder')} <Money amount={c.minOrderAmount} />
                                  {!eligible && <> · {t('checkout.addMore')} <Money amount={c.minOrderAmount - cartTotal} /> {t('checkout.more')}</>}
                                </p>
                              )}
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => handleApplyCoupon(c.code)} disabled={couponLoading || !eligible}>
                              {t('cart.couponApply')}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
              {couponError && <p className="mt-2 text-xs text-destructive">{couponError}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Row label={t('cart.subtotal')} value={<Money amount={cartTotal} />} />
              {discountAmount > 0 && (
                <Row label={t('cart.discount')} value={<Money amount={discountAmount} sign="-" />} className="text-emerald-600" />
              )}
              {taxAmount > 0 && (
                <Row label={t('checkout.inclVat')} value={<Money amount={taxAmount} />} className="text-xs" />
              )}
            </div>

            <Separator className="my-4" />
            <div className="flex justify-between text-base font-semibold">
              <span>{t('cart.total')}</span>
              <span><Money amount={grandTotal} /></span>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full gap-2" disabled={loading}>
              <FaWhatsapp className="size-4" />
              {loading ? t('checkout.placingOrder') : t('checkout.orderViaWhatsApp', { defaultValue: 'Order via WhatsApp' })}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" /> {t('checkout.orderViaWhatsAppNote', { defaultValue: 'You’ll be redirected to WhatsApp to confirm your order.' })}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
