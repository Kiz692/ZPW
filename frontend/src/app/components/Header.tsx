/**
 * Header Component
 * Application header with navigation and user menu
 */

import { useAuth } from '@/shared/hooks/useAuth';
import { useTenant } from '@/shared/hooks/useTenant';
import { useTranslation } from 'react-i18next';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { tenant } = useTenant();

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t('app.name')}</h1>
          {tenant && (
            <span className="text-sm text-muted-foreground">{tenant.name}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.username}</span>
              </div>
              <button
                onClick={() => {
                  logout().catch(console.error);
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                title={t('common.logout')}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
