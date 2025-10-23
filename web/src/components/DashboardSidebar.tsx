import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  features?: string[];
  badge?: string;
  onClick?: () => void;
  isNew?: boolean;
}

interface SidebarSectionProps {
  title: string;
  items: SidebarItem[];
  isOpen?: boolean;
  onItemClick?: (item: SidebarItem) => void;
}

/**
 * Componente de sección colapsable del sidebar
 * Sigue las guías de diseño de Tailwind CSS y React
 */
function SidebarSection({ 
  title, 
  items, 
  isOpen = true, 
  onItemClick 
}: SidebarSectionProps) {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <span className="uppercase tracking-wide">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick?.(item);
                  item.onClick?.();
                }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left rounded-lg hover:bg-blue-50 hover:border-l-2 hover:border-blue-500 transition-all duration-200 group"
                title={item.description}
              >
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 group-hover:text-blue-600">
                      {item.label}
                    </p>
                    {item.isNew && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Nuevo
                      </span>
                    )}
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                  {item.features && item.features.length > 0 && (
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Componente Sidebar principal
 * Diseño profesional y responsive que sigue mejores prácticas de React
 */
interface DashboardSidebarProps {
  onNavigate?: (section: string) => void;
  className?: string;
}

export function DashboardSidebar({ onNavigate, className = '' }: DashboardSidebarProps) {
  const phase6Features: SidebarItem[] = [
    {
      id: 'cloud-storage',
      label: 'R2 Cloud Storage',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      description: 'Almacenamiento seguro en la nube',
      features: [
        'URLs firmadas para acceso seguro',
        'Carga y descarga de archivos',
        'Respaldo automático',
      ],
      isNew: true,
    },
    {
      id: 'admin-panel',
      label: 'Panel de Administrador',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Revisión y aprobación de documentos',
      features: [
        'Visualizar solicitudes pendientes',
        'Aprobar documentos',
        'Rechazar con comentarios',
      ],
      isNew: true,
    },
    {
      id: 'role-based',
      label: 'Control de Acceso por Roles',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Permisos basados en roles Admin/Usuario',
      features: [
        'Acceso administrador',
        'Acceso usuario estándar',
        'Permisos personalizados',
      ],
      isNew: true,
    },
    {
      id: 'comments',
      label: 'Sistema de Comentarios',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      description: 'Revisión y retroalimentación en tiempo real',
      features: [
        'Comentarios en documentos',
        'Historial de cambios',
        'Notificaciones de respuestas',
      ],
      isNew: true,
    },
  ];

  const advancedFeatures: SidebarItem[] = [
    {
      id: 'real-time',
      label: 'Actualizaciones en Tiempo Real',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'WebSocket para notificaciones instantáneas',
      badge: 'Próximamente',
    },
    {
      id: 'email-alerts',
      label: 'Alertas por Email',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Recordatorios de vencimiento de documentos',
      badge: 'Próximamente',
    },
    {
      id: 'analytics',
      label: 'Análisis y Reportes',
      icon: ({ className: cls }: { className?: string }) => (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Dashboard de cumplimiento y análisis',
      badge: 'Próximamente',
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    onNavigate?.(item.id);
  };

  return (
    <aside className={`w-full max-w-sm bg-white border-r border-gray-200 shadow-sm h-full overflow-y-auto ${className}`}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900">
          ✨ Nuevas Funcionalidades
        </h2>
        <p className="text-xs text-gray-500 mt-1">Phase 6 - Gestión Avanzada</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Phase 6 Features */}
        <SidebarSection
          title="Phase 6 - Ahora Disponibles"
          items={phase6Features}
          isOpen={true}
          onItemClick={handleItemClick}
        />

        {/* Advanced Features Coming Soon */}
        <SidebarSection
          title="Próximas Características"
          items={advancedFeatures}
          isOpen={false}
          onItemClick={handleItemClick}
        />

        {/* Help Section */}
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-blue-800 mb-3">
              Consulta nuestra documentación o contacta al equipo de soporte.
            </p>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                Ver Documentación
              </button>
              <button className="w-full px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors duration-200">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-xs text-gray-500 space-y-1 pb-4">
          <p>📌 <strong>Tip:</strong> Expande las secciones para ver características detalladas.</p>
          <p>🚀 Mantente actualizado con nuestras nuevas funcionalidades.</p>
        </div>
      </div>
    </aside>
  );
}
