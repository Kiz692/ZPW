/**
 * Sidebar Component
 * Navigation sidebar with main menu items
 */

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Trophy,
  Bot,
  UserCircle,
  Briefcase,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export default function Sidebar() {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { path: '/people', icon: Users, label: t('navigation.people') },
    { path: '/org', icon: Building2, label: t('navigation.org') },
    { path: '/leave', icon: Calendar, label: t('navigation.leave') },
    { path: '/performance', icon: TrendingUp, label: t('navigation.performance') },
    { path: '/gamification', icon: Trophy, label: t('navigation.gamification') },
    { path: '/ai', icon: Bot, label: t('navigation.ai') },
    { path: '/ess', icon: UserCircle, label: t('navigation.ess') },
    { path: '/mss', icon: Briefcase, label: t('navigation.mss') },
  ];

  return (
    <aside className="w-64 border-r bg-card">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
