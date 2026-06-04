import type { LucideIcon } from 'lucide-react';

export interface ResolvedHomeMenuItem {
  key: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
}

export interface HomeMenuPanelProps {
  items: ResolvedHomeMenuItem[];
  onNavigate?: () => void;
  preview?: boolean;
}
