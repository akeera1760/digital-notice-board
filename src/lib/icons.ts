import {
  BookOpen, Users, Calendar, Pencil, CreditCard, FileText,
  Palmtree, Briefcase, Award, Trophy, Dot
} from 'lucide-react';

export const iconMap: Record<string, typeof Dot> = {
  BookOpen,
  Users,
  Calendar,
  Pencil,
  CreditCard,
  FileText,
  Palmtree,
  Briefcase,
  Award,
  Trophy,
  Dot,
};

export function getIcon(iconName: string | null | undefined) {
  if (!iconName || !iconMap[iconName]) {
    return Dot;
  }
  return iconMap[iconName];
}
