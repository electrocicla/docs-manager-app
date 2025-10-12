import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';

/**
 * Página de Login
 * Responsabilidad: Autenticación de usuarios
 */
export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await iniciarSesion({ email, password });
      // Redirigir según el rol se manejará en el hook
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">SR-PREVENCION</h2>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        <Tarjeta>
          <form onSubmit={manejarEnvio} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@empresa.cl"
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Boton
              type="submit"
              className="w-full"
              cargando={cargando}
            >
              Iniciar Sesión
            </Boton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/registro"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Tarjeta>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
