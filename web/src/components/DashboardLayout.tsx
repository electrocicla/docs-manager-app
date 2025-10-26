import React from 'react';
import { DashboardSidebar } from '../components/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

/**
 * Layout principal del dashboard con sidebar persistente
 * Incluye navegación lateral y breadcrumbs globales
 */
export function DashboardLayout({
  children,
  title,
  subtitle,
  showHeader = true
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col">
      {/* Header - Opcional */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
              <div className="flex items-center space-x-4">
                {/* Espacio para elementos del header si es necesario */}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content with Sidebar Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on small screens */}
        <div className="hidden lg:block w-80 border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}