import type * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  FileText,
  Briefcase,
  Users,
  User,
  HelpCircle,
  LogOut,
  Home,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route?: string;
  divider?: boolean;
  onClick?: () => void;
  description?: string;
}

/**
 * Sidebar profesional para navegación en el dashboard
 * Muestra opciones relevantes según el rol del usuario
 */
export function DashboardSidebar() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  // Items de navegación según rol
  const getNavItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [];

    // Items específicos según rol
    if (usuario?.role === 'admin') {
      baseItems.push(
        {
          id: 'inicio',
          label: 'Panel Principal',
          icon: Home,
          route: '/admin',
          description: 'Dashboard administrativo'
        },
        {
          id: 'empresas',
          label: 'Gestión de Empresas',
          icon: Briefcase,
          route: '/companies',
          description: 'Gestiona empresas y trabajadores',
        },
        {
          id: 'admin-documentos',
          label: 'Revisar Documentos',
          icon: FileText,
          route: '/admin/documents',
          description: 'Panel de revisión de documentos',
        },
        {
          id: 'usuarios',
          label: 'Gestionar Usuarios',
          icon: Users,
          route: '/admin',
          description: 'Administra usuarios del sistema',
        }
      );
    } else if (usuario?.role === 'professional') {
      baseItems.push(
        {
          id: 'inicio',
          label: 'Mi Dashboard',
          icon: Home,
          route: '/profesional',
        },
        {
          id: 'cotizaciones',
          label: 'Cotizar Trabajos',
          icon: Briefcase,
          route: '/profesional',
          description: 'Cotiza trabajos solicitados',
        }
      );
    } else {
      // Usuario regular
      baseItems.push(
        {
          id: 'inicio',
          label: 'Inicio',
          icon: Home,
          route: '/dashboard',
        },
        {
          id: 'trabajos',
          label: 'Mis Solicitudes',
          icon: FileText,
          route: '/dashboard',
          description: 'Ver todas tus solicitudes de servicios',
        },
        {
          id: 'empresas',
          label: 'Mis Empresas',
          icon: Briefcase,
          route: '/companies',
          description: 'Gestiona tus empresas y trabajadores',
        }
      );
    }

    // Items comunes
    baseItems.push(
      {
        id: 'divider1',
        label: '',
        icon: Home,
        divider: true,
      },
      {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: User,
        route: '/perfil',
        description: 'Edita tu información personal',
      },
      {
        id: 'soporte',
        label: 'Ayuda y Soporte',
        icon: HelpCircle,
        onClick: () => {
          // En el futuro, abrir modal de soporte o ir a página de FAQ
          console.log('Abrir soporte');
        },
        description: 'Contacta con nuestro equipo',
      },
      {
        id: 'divider2',
        label: '',
        icon: Home,
        divider: true,
      },
      {
        id: 'logout',
        label: 'Cerrar Sesión',
        icon: LogOut,
        onClick: cerrarSesion,
      }
    );

    return baseItems;
  };

  const navItems = getNavItems();

  const handleNavigate = (item: NavigationItem) => {
    if (item.route) {
      navigate(item.route);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <aside className="h-full bg-white border-r border-gray-200 shadow-sm overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <h2 className="text-lg font-bold text-gray-900">
          Menu de Navegación
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {usuario?.full_name}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          if (item.divider) {
            return (
              <div key={item.id} className="my-4 border-t border-gray-200" />
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left rounded-lg hover:bg-blue-50 hover:border-l-4 hover:border-blue-500 transition-all duration-200 group"
              title={item.description}
            >
              <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-gray-200 p-6 space-y-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>💡 Consejo:</strong> Usa este menú para navegar por las diferentes secciones de tu cuenta.
          </p>
        </div>
      </div>
    </aside>
  );
}
