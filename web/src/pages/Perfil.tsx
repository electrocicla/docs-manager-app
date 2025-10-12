import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Boton } from '../components/ui/Boton';
import { Input } from '../components/ui/Input';
import { Tarjeta } from '../components/ui/Tarjeta';
import { Save, User } from 'lucide-react';

export default function Perfil() {
  const { usuario, recargarPerfil } = useAuth();
  const [editando, setEditando] = useState(false);
  const [fullName, setFullName] = useState(usuario?.full_name || '');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarGuardar = async () => {
    setCargando(true);
    setError('');

    try {
      // En una implementación real, llamar a API para actualizar perfil
      // await servicioAuth.actualizarPerfil({ full_name: fullName });
      await recargarPerfil();
      setEditando(false);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Tarjeta>
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-8 h-8 text-gray-400" />
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                value={usuario?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                El email no se puede cambiar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              {editando ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                />
              ) : (
                <Input
                  value={usuario?.full_name || 'No especificado'}
                  disabled
                  className="bg-gray-50"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <Input
                value={usuario?.role === 'user' ? 'Cliente' :
                       usuario?.role === 'professional' ? 'Profesional' : 'Administrador'}
                disabled
                className="bg-gray-50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              {editando ? (
                <>
                  <Boton
                    onClick={manejarGuardar}
                    cargando={cargando}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Boton>
                  <Boton
                    variante="secondary"
                    onClick={() => {
                      setEditando(false);
                      setFullName(usuario?.full_name || '');
                    }}
                    disabled={cargando}
                  >
                    Cancelar
                  </Boton>
                </>
              ) : (
                <Boton onClick={() => setEditando(true)}>
                  Editar Perfil
                </Boton>
              )}
            </div>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}