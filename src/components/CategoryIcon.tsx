import React from 'react';
import {
  ShoppingCart,
  Utensils,
  Home,
  Zap,
  Car,
  Tv,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  PiggyBank,
  MoreHorizontal,
  Coffee,
  Plane,
  Briefcase,
  Gift,
  Smartphone,
  ShieldCheck,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'ShoppingCart':
      return <ShoppingCart {...props} />;
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Tv':
      return <Tv {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'PiggyBank':
      return <PiggyBank {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal {...props} />;
  }
};

export const AVAILABLE_ICONS = [
  'ShoppingCart',
  'Utensils',
  'Home',
  'Zap',
  'Car',
  'Tv',
  'ShoppingBag',
  'HeartPulse',
  'Film',
  'GraduationCap',
  'PiggyBank',
  'Coffee',
  'Plane',
  'Briefcase',
  'Gift',
  'Smartphone',
  'ShieldCheck',
  'MoreHorizontal',
];
