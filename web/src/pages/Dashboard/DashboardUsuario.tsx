import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTrabajos } from '../../hooks/useTrabajos';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';
import { TarjetaTrabajo } from '../../components/TarjetaTrabajo';
import { InfoCard } from '../../components/ui/InfoCard';
import { ProcessSteps } from '../../components/ui/ProcessSteps';
import { StatCard, StatsGrid } from '../../components/ui/StatCard';
import { 
  Plus, 
  LogOut, 
  Shield, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  BookOpen,
  Users,
  Building2,
  ClipboardCheck,
  Award,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DashboardUsuario() {
  const { usuario, cerrarSesion } = useAuth();
  const { trabajos, cargando, cargarTrabajos } = useTrabajos();
  const navigate = useNavigate();
  const [mostrarInfo, setMostrarInfo] = useState(true);

  useEffect(() => {
    cargarTrabajos();
  }, [cargarTrabajos]);

  // Calcular estadísticas
  const estadisticas = {
    total: trabajos.length,
    enProceso: trabajos.filter(t => t.status === 'REVISION_EN_PROGRESO' || t.status === 'TRABAJO_EN_PROGRESO').length,
    completados: trabajos.filter(t => t.status === 'FINALIZADO').length,
    pendientes: trabajos.filter(t => t.status === 'POR_REVISAR').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
              <p className="text-gray-600 mt-1">Gestión de Prevención de Riesgos</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bienvenido</p>
                <p className="font-semibold text-gray-900">{usuario?.full_name}</p>
              </div>
              <Boton variante="secondary" onClick={cerrarSesion}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Boton>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Sección informativa colapsable */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 cursor-pointer flex justify-between items-center"
            onClick={() => setMostrarInfo(!mostrarInfo)}
          >
            <div className="flex items-center space-x-3">
              <Info className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                ¿Qué es SR-PREVENCION y cómo puede ayudarte?
              </h2>
            </div>
            {mostrarInfo ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white" />
            )}
          </div>
          
          {mostrarInfo && (
            <div className="px-6 pb-6 space-y-4">
              <p className="text-white text-lg leading-relaxed">
                SR-PREVENCION es tu plataforma integral para gestionar todos los aspectos de <strong>prevención de riesgos laborales</strong> que exige la normativa chilena. 
                Conectamos empresas con <strong>ingenieros especializados en prevención de riesgos</strong> certificados para cumplir con las obligaciones ante el SEREMI de Salud.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Cumplimiento Normativo
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    Asegura el cumplimiento del <strong>DS 594</strong> (Reglamento sobre Condiciones Sanitarias y Ambientales Básicas), 
                    <strong> Ley 16.744</strong> (Seguro Social contra Accidentes del Trabajo), y todas las normativas del Ministerio de Salud y SEREMI.
                  </p>
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-2 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Profesionales Certificados
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    Accede a una red de <strong>ingenieros en prevención de riesgos</strong> certificados por SEREMI de Salud, 
                    con experiencia en <strong>fiscalizaciones, auditorías y asesorías técnicas</strong> para tu empresa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas - Enhanced with Phase 6 Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen de Actividad</h2>
          <StatsGrid>
            <StatCard
              title="Total de Trabajos"
              value={estadisticas.total}
              icon={FileText}
              color="blue"
              description="Documentos gestionados"
            />
            <StatCard
              title="En Proceso"
              value={estadisticas.enProceso}
              icon={Clock}
              color="yellow"
              description="Trabajos activos"
            />
            <StatCard
              title="Completados"
              value={estadisticas.completados}
              icon={CheckCircle}
              color="green"
              description="Finalizados exitosamente"
            />
            <StatCard
              title="Pendientes"
              value={estadisticas.pendientes}
              icon={AlertTriangle}
              color="red"
              description="Requieren atención"
            />
          </StatsGrid>
          
          {/* Phase 6 Features Announcement */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              ✨ Nuevas Features Phase 6
            </h3>
            <p className="text-green-800 text-sm">
              • Gestión avanzada de documentos con R2 Cloud Storage
              • Panel de administrador para revisar y aprobar documentos
              • Control de acceso basado en roles (Admin/Usuario)
              • Sistema de comentarios y revisión de documentos
            </p>
          </div>
        </div>

        {/* Mis Trabajos */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mis Trabajos</h2>
              <p className="text-gray-600 mt-1">Gestiona y da seguimiento a tus solicitudes</p>
            </div>
            <Boton onClick={() => navigate('/crear-trabajo')} className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Trabajo
            </Boton>
          </div>

          {cargando ? (
            <Tarjeta>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando trabajos...</p>
              </div>
            </Tarjeta>
          ) : trabajos.length === 0 ? (
            <Tarjeta className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes trabajos aún
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Crea uno para comenzar a gestionar tu documentación de prevención de riesgos!
              </p>
              <Boton onClick={() => navigate('/crear-trabajo')}>
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Trabajo
              </Boton>
            </Tarjeta>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trabajos.map(trabajo => (
                <TarjetaTrabajo
                  key={trabajo.id}
                  trabajo={trabajo}
                  alHacerClic={() => navigate(`/trabajo/${trabajo.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Proceso de trabajo */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo funciona el proceso?</h2>
          <ProcessSteps
            steps={[
              {
                number: 1,
                title: 'Crea tu Solicitud',
                description: 'Describe el servicio que necesitas: plan de emergencia, protocolo de seguridad, evaluación de riesgos, fiscalización, etc. Adjunta documentos si los tienes.',
              },
              {
                number: 2,
                title: 'Revisión Profesional',
                description: 'Un ingeniero en prevención de riesgos certificado revisa tu solicitud y evalúa los documentos. Te contactará para aclarar detalles si es necesario.',
              },
              {
                number: 3,
                title: 'Recibe Cotización',
                description: 'El profesional te enviará una cotización detallada con los servicios, plazos y costos. Puedes aceptarla o solicitar ajustes.',
              },
              {
                number: 4,
                title: 'Trabajo en Progreso',
                description: 'Una vez aceptada, el profesional elabora los documentos técnicos, protocolos o informes según normativa SEREMI y ministerios correspondientes.',
              },
              {
                number: 5,
                title: 'Entrega y Firma Digital',
                description: 'Recibes los documentos finales con firma digital del profesional. Listos para presentar ante SEREMI, mutuales o para uso interno de tu empresa.',
              },
            ]}
          />
        </div>

        {/* Información sobre servicios */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicios de Prevención de Riesgos</h2>
          <p className="text-gray-600 mb-6">
            Nuestros ingenieros certificados pueden ayudarte con:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              icon={<ClipboardCheck className="w-6 h-6" />}
              title="Reglamento Interno de Orden, Higiene y Seguridad (RIOHS)"
              description="Documento obligatorio según Código del Trabajo Art. 153. Debe ser registrado en Dirección del Trabajo y actualizado periódicamente."
            />
            
            <InfoCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Plan de Emergencia y Evacuación"
              description="Requisito DS 594 y Ley 16.744. Incluye análisis de riesgos, rutas de evacuación, zonas seguras y protocolos de actuación ante emergencias."
            />
            
            <InfoCard
              icon={<Building2 className="w-6 h-6" />}
              title="Programa de Vigilancia Epidemiológica"
              description="Monitoreo de riesgos específicos: ruido, sílice, químicos, ergonómicos. Exigido por SEREMI y mutuales para empresas con exposición ocupacional."
            />
            
            <InfoCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Matriz de Identificación de Peligros y Evaluación de Riesgos (IPER)"
              description="Herramienta fundamental para identificar peligros, evaluar riesgos y establecer controles. Base para la gestión preventiva."
            />
            
            <InfoCard
              icon={<Award className="w-6 h-6" />}
              title="Protocolos MINSAL"
              description="Cumplimiento de protocolos obligatorios: TMERT, manejo manual de cargas, PREXOR (ruido), PLANESI (sílice), exposición a químicos, etc."
            />
            
            <InfoCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Asesoría en Fiscalizaciones SEREMI"
              description="Preparación y acompañamiento en inspecciones de la autoridad sanitaria. Corrección de observaciones y levantamiento de sumarios."
            />
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Protege a tu Empresa y Trabajadores
          </h2>
          <p className="text-white text-lg mb-6 max-w-3xl mx-auto">
            El cumplimiento de la normativa de prevención de riesgos no solo evita multas y sanciones del SEREMI, 
            sino que <strong>protege la vida y salud de tus trabajadores</strong>, reduce accidentes laborales y mejora 
            el ambiente de trabajo. ¡Comienza hoy mismo!
          </p>
          <Boton 
            onClick={() => navigate('/crear-trabajo')}
            className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-8 text-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Crear Nueva Solicitud
          </Boton>
        </div>

      </main>
    </div>
  );
}