import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';
import { PasswordStrength, evaluatePasswordStrength } from '../../components/ui/PasswordStrength';

/**
 * Página de Registro
 * Responsabilidad: Registro de nuevos usuarios
 */
export default function Registro() {
  const navigate = useNavigate();
  const { registrarse } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.email) {
      nuevosErrores.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'Correo electrónico inválido';
    }

    if (!formData.full_name) {
      nuevosErrores.full_name = 'El nombre completo es requerido';
    }

    // Validación mejorada de contraseña
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = evaluatePasswordStrength(formData.password);
      
      if (!passwordValidation.isValid) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    }

    // Validación de confirmación de contraseña
    if (!formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setErrores({});
    setCargando(true);

    try {
      await registrarse({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: 'user',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrores({ general: err.data?.error || 'Error al registrarse' });
    } finally {
      setCargando(false);
    }
  };

  const actualizarCampo = (campo: string, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo al escribir
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
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
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        <Tarjeta>
          <form onSubmit={manejarEnvio} className="space-y-4">
            {errores.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errores.general}
              </div>
            )}

            <Input
              label="Nombre Completo"
              type="text"
              value={formData.full_name}
              onChange={(e) => actualizarCampo('full_name', e.target.value)}
              error={errores.full_name}
              required
              placeholder="Juan Pérez"
            />

            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => actualizarCampo('email', e.target.value)}
              error={errores.email}
              required
              placeholder="tu@empresa.cl"
            />

            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Contraseña"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => actualizarCampo('password', e.target.value)}
                  error={errores.password}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Indicador de fortaleza */}
              {formData.password && (
                <PasswordStrength password={formData.password} className="mt-3" />
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirmar Contraseña"
                type={mostrarConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => actualizarCampo('confirmPassword', e.target.value)}
                error={errores.confirmPassword}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {mostrarConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              
              {/* Indicador de coincidencia */}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  <span>Las contraseñas coinciden</span>
                </div>
              )}
            </div>

            <Boton
              type="submit"
              className="w-full"
              cargando={cargando}
            >
              Registrarse
            </Boton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Inicia sesión aquí
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
