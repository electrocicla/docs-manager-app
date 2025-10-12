import { Link } from 'react-router-dom';
import { Shield, FileCheck, Users, ArrowRight } from 'lucide-react';
import { Boton } from '../components/ui/Boton';

/**
 * Página Landing
 * Responsabilidad: Página de inicio pública
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              SR-PREVENCION
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Boton variante="secondary">Iniciar Sesión</Boton>
            </Link>
            <Link to="/registro">
              <Boton>Registrarse</Boton>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Gestión Profesional de
          <span className="text-primary-600"> Prevención de Riesgos</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Conectamos empresas chilenas con profesionales certificados en
          prevención de riesgos para revisión y certificación de documentos.
        </p>
        <Link to="/registro">
          <Boton className="text-lg px-8 py-3">
            Comenzar Ahora
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </Boton>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FileCheck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Revisión de Documentos
            </h3>
            <p className="text-gray-600">
              Sube tus documentos y recibe revisiones profesionales de expertos
              certificados en prevención de riesgos.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Profesionales Certificados
            </h3>
            <p className="text-gray-600">
              Trabaja con ingenieros en prevención de riesgos certificados y con
              experiencia comprobada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Documentos Firmados
            </h3>
            <p className="text-gray-600">
              Recibe tus documentos certificados y firmados digitalmente con
              validez legal en Chile.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8">
            Únete a empresas que confían en SR-PREVENCION para su gestión de
            riesgos.
          </p>
          <Link to="/registro">
            <Boton variante="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
              Crear Cuenta Gratuita
            </Boton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 SR-PREVENCION. Todos los derechos reservados.</p>
          <p className="text-gray-400 mt-2">
            Plataforma de gestión de prevención de riesgos en Chile
          </p>
        </div>
      </footer>
    </div>
  );
}
