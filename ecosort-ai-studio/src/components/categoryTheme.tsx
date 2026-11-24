import React from 'react';
import { AlertTriangle, Cpu, Leaf, Package } from 'lucide-react';
import { WasteCategoryId } from '../types/ecosort';

export interface CategoryStyle {
  icon: React.ComponentType<{ className?: string }>;
  surfaceBg: string;
  accentBg: string;
  accentText: string;
  border: string;
  barColor: string;
}

export const CATEGORY_STYLES: Record<WasteCategoryId, CategoryStyle> = {
  wet: {
    icon: Leaf,
    surfaceBg: 'bg-[#E6F2EA]',
    accentBg: 'bg-[#1F4E37]',
    accentText: 'text-[#1F4E37]',
    border: 'border-[#C5DEC9]',
    barColor: '#1F4E37',
  },
  dry: {
    icon: Package,
    surfaceBg: 'bg-[#EBF1EC]',
    accentBg: 'bg-[#567660]',
    accentText: 'text-[#395543]',
    border: 'border-[#CFDAD1]',
    barColor: '#6F8F78',
  },
  ewaste: {
    icon: Cpu,
    surfaceBg: 'bg-[#EFF2F0]',
    accentBg: 'bg-[#2E3B35]',
    accentText: 'text-[#2E3B35]',
    border: 'border-[#D2DAD5]',
    barColor: '#41524A',
  },
  hazardous: {
    icon: AlertTriangle,
    surfaceBg: 'bg-[#FBF3EB]',
    accentBg: 'bg-[#9A4B22]',
    accentText: 'text-[#8C3F19]',
    border: 'border-[#EAD3BE]',
    barColor: '#B55B2D',
  },
};

export function CategoryIcon({
  category,
  className = 'w-5 h-5',
}: {
  category: WasteCategoryId;
  className?: string;
}) {
  const Icon = CATEGORY_STYLES[category].icon;
  return <Icon className={className} aria-hidden="true" />;
}
