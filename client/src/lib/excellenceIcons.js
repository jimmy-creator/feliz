import {
  ShieldCheck, BadgeCheck, Flame, Truck, RotateCcw, Headset, CreditCard,
  Sparkles, Award, Wrench, Droplets, Leaf, Clock, ThumbsUp, Star, Package,
} from 'lucide-react';

// Icons the "Built For Excellence" cards can use. Stored as string keys in the
// DB (admin picks one), resolved to a lucide component here. Keep keys stable —
// changing a key orphans any card already saved with it.
export const EXCELLENCE_ICONS = {
  shield: ShieldCheck,
  badge: BadgeCheck,
  flame: Flame,
  truck: Truck,
  returns: RotateCcw,
  support: Headset,
  payment: CreditCard,
  sparkles: Sparkles,
  award: Award,
  wrench: Wrench,
  droplets: Droplets,
  leaf: Leaf,
  clock: Clock,
  thumbsup: ThumbsUp,
  star: Star,
  package: Package,
};

// Human labels for the admin picker, in display order.
export const EXCELLENCE_ICON_OPTIONS = [
  { value: 'shield', label: 'Shield (Quality)' },
  { value: 'badge', label: 'Badge (Warranty)' },
  { value: 'flame', label: 'Flame (Heat)' },
  { value: 'truck', label: 'Truck (Shipping)' },
  { value: 'returns', label: 'Returns' },
  { value: 'support', label: 'Support / Headset' },
  { value: 'payment', label: 'Payment / Card' },
  { value: 'award', label: 'Award' },
  { value: 'wrench', label: 'Wrench / Service' },
  { value: 'droplets', label: 'Droplets / Clean' },
  { value: 'leaf', label: 'Leaf / Eco' },
  { value: 'clock', label: 'Clock / Time' },
  { value: 'thumbsup', label: 'Thumbs Up' },
  { value: 'star', label: 'Star' },
  { value: 'package', label: 'Package' },
  { value: 'sparkles', label: 'Sparkles' },
];

// Resolve an icon key to a component, falling back to a neutral mark.
export function excellenceIcon(key) {
  return EXCELLENCE_ICONS[key] || Sparkles;
}
