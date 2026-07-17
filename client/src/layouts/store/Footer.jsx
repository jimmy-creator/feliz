import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'FELIZ';

const SUPPORT_PHONE = '+91 9688 94100344';
const SUPPORT_EMAIL = 'support@felizsinks.com';
const STORE_ADDRESS = 'Kochi, Kerala, India – 682001';

// Footer columns — labels transcribed from the approved design.
const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Sinks', to: '/products' },
      { label: 'Quartz Sinks', to: '/products?category=Quartz%20Sinks' },
      { label: 'Single Bowl', to: '/products?category=Single%20Bowl' },
      { label: 'Double Bowl', to: '/products?category=Double%20Bowl' },
      { label: 'Colored Sinks', to: '/products?category=Colored%20Sinks' },
      { label: 'Accessories', to: '/products?category=Accessories' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Warranty', to: '/return-policy' },
      { label: 'Shipping Policy', to: '/shipping-policy' },
      { label: 'Return & Refund', to: '/refund-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Track Order', to: '/orders' },
      { label: "FAQ's", to: '/contact' },
      { label: 'Installation Guide', to: '/contact' },
      { label: 'Care & Maintenance', to: '/contact' },
    ],
  },
];

// Inline brand marks — avoids depending on lucide brand icons that get dropped
// between versions. Hrefs are placeholders until real profiles are shared.
const SOCIALS = [
  { label: 'Facebook', href: '#', path: 'M13.5 9H15V6.5h-1.9C11 6.5 10 7.8 10 9.7V11H8.5v2.5H10V19h2.6v-5.5h1.8l.3-2.5h-2.1V9.9c0-.6.2-.9.9-.9Z' },
  { label: 'WhatsApp', href: '#', path: 'M12 5.5A6.4 6.4 0 0 0 6.3 15l-.8 3 3.1-.8A6.4 6.4 0 1 0 12 5.5Zm0 1.3a5.1 5.1 0 0 1 0 10.2 5 5 0 0 1-2.6-.7l-.2-.1-1.5.4.4-1.5-.1-.2a5.1 5.1 0 0 1 4-8.1Zm-1.7 2.4c-.1-.3-.2-.3-.4-.3h-.3a.7.7 0 0 0-.5.2c-.2.2-.6.6-.6 1.4s.6 1.6.7 1.7c.1.2 1.2 1.9 3 2.6 1.5.6 1.8.5 2.1.4.3 0 1-.4 1.1-.8.2-.4.2-.7.1-.8l-.4-.2-1-.5c-.2 0-.3-.1-.4.1l-.5.6c-.1.1-.2.2-.4.1a4.2 4.2 0 0 1-1.2-.8 4.6 4.6 0 0 1-.9-1.1c0-.2 0-.3.1-.4l.3-.3.2-.3v-.3l-.5-1.2Z' },
  { label: 'Instagram', href: '#', path: 'M12 8.6A3.4 3.4 0 1 0 12 15.4 3.4 3.4 0 0 0 12 8.6Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm3.6-5.9a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM8.4 6.2h7.2A2.6 2.6 0 0 1 18.2 8.8v6.4a2.6 2.6 0 0 1-2.6 2.6H8.4a2.6 2.6 0 0 1-2.6-2.6V8.8a2.6 2.6 0 0 1 2.6-2.6Zm0 1.3A1.3 1.3 0 0 0 7.1 8.8v6.4a1.3 1.3 0 0 0 1.3 1.3h7.2a1.3 1.3 0 0 0 1.3-1.3V8.8a1.3 1.3 0 0 0-1.3-1.3H8.4Z' },
  { label: 'Pinterest', href: '#', path: 'M12 5.8a6.2 6.2 0 0 0-2.3 12c0-.5 0-1.2.1-1.7l.9-3.7s-.2-.4-.2-1.1c0-1 .6-1.8 1.3-1.8.6 0 .9.5.9 1s-.4 1.6-.5 2.5c-.1.7.4 1.3 1.1 1.3 1.3 0 2.2-1.7 2.2-3.6 0-1.5-1-2.6-2.8-2.6a3.2 3.2 0 0 0-3.3 3.2c0 .6.2 1 .5 1.3.1.2.1.2.1.4l-.2.6c0 .2-.2.3-.4.2-1-.4-1.4-1.5-1.4-2.7 0-2 1.7-4.4 5-4.4 2.7 0 4.4 1.9 4.4 4 0 2.7-1.5 4.8-3.8 4.8-.7 0-1.4-.4-1.7-.9l-.5 1.8c-.1.6-.5 1.3-.8 1.8A6.2 6.2 0 0 0 12 5.8Z' },
  { label: 'YouTube', href: '#', path: 'M18.5 9.2a1.7 1.7 0 0 0-1.2-1.2c-1-.3-5.3-.3-5.3-.3s-4.3 0-5.3.3A1.7 1.7 0 0 0 5.5 9.2 17.6 17.6 0 0 0 5.2 12c0 1 .1 1.9.3 2.8a1.7 1.7 0 0 0 1.2 1.2c1 .3 5.3.3 5.3.3s4.3 0 5.3-.3a1.7 1.7 0 0 0 1.2-1.2c.2-.9.3-1.8.3-2.8s-.1-1.9-.3-2.8ZM10.8 13.9V10l3.4 2-3.4 1.9Z' },
];

// Accepted payment methods. Rendered as text badges — the real brand artwork
// isn't available; swap in logo files when they are.
const PAYMENTS = [
  { label: 'VISA', className: 'text-[#1a1f71]' },
  { label: 'MasterCard', className: 'text-[#eb001b]' },
  { label: 'RuPay', className: 'text-[#097939]' },
  { label: 'UPI', className: 'text-[#ff7300]' },
];

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="text-[11px] text-muted-foreground transition-colors hover:text-[color:var(--copper)]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mx-auto mt-5 max-w-[1330px] px-3 pb-4 lg:px-6">
      <div className="glass rounded-[22px] px-6 py-8 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/images/feliz-logo.png" alt={STORE_NAME} className="h-9 w-auto" />
            </Link>
            <p className="mt-3 max-w-[15rem] text-[11px] leading-relaxed text-muted-foreground">
              FELIZ offers premium quality kitchen sinks designed for modern kitchens
              with elegance and durability.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="inline-flex size-7 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-colors hover:border-[color:var(--copper)] hover:bg-[color:var(--copper)] hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <FooterCol key={col.title} {...col} />
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground">Contact Us</h4>
            <ul className="mt-3 flex flex-col gap-2.5 text-[11px] text-muted-foreground">
              <li>
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 transition-colors hover:text-[color:var(--copper)]"
                >
                  <Phone className="size-3.5 shrink-0" strokeWidth={1.6} /> {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-[color:var(--copper)]"
                >
                  <Mail className="size-3.5 shrink-0" strokeWidth={1.6} /> {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.6} /> {STORE_ADDRESS}
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {PAYMENTS.map(({ label, className }) => (
                <span
                  key={label}
                  className={`inline-flex h-6 items-center rounded-[4px] bg-white px-2 text-[9px] font-bold shadow-sm ${className}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
