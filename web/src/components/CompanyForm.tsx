import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Globe, Users, FileText, X, Loader } from 'lucide-react';
import type { Company, CompanyInput } from '../types/company';
import { formatRutInput, isValidRut, normalizeRut } from '../utils/rut';

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: CompanyInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface CompanyFormState {
  name: string;
  rut: string;
  industry: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  employees_count: string;
  description: string;
}

const INITIAL_STATE: CompanyFormState = {
  name: '',
  rut: '',
  industry: '',
  address: '',
  city: '',
  region: '',
  phone: '',
  email: '',
  website: '',
  employees_count: '',
  description: '',
};

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
  loading = false,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormState>(INITIAL_STATE);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos de empresa si estamos editando
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
  rut: formatRutInput(company.rut || ''),
        industry: company.industry || '',
        address: company.address || '',
        city: company.city || '',
        region: company.region || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        employees_count: company.employees_count?.toString() || '',
        description: company.description || '',
      });
    }
  }, [company]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!isValidRut(formData.rut)) {
      newErrors.rut = 'Formato de RUT inválido (ej: 12.345.678-K)';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'La región es requerida';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.employees_count && isNaN(Number(formData.employees_count))) {
      newErrors.employees_count = 'Debe ser un número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  const nextValue = name === 'rut' ? formatRutInput(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
    }));
    // Limpiar error de este campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Convertir campos numéricos
      const employeesCountValue = formData.employees_count.trim();
      const dataToSubmit: CompanyInput = {
        name: formData.name.trim(),
        rut: normalizeRut(formData.rut),
        industry: formData.industry.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim(),
        region: formData.region.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
  employees_count: employeesCountValue ? Number(employeesCountValue) : undefined,
        description: formData.description.trim() || undefined,
      };

      await onSubmit(dataToSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!company;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={submitting || loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Acme Corporation S.A."
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting || loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* RUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT *
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  placeholder="Ej: 12.345.678-K"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.rut ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting || loading || isEditing}
                />
                {errors.rut && <p className="text-red-500 text-sm mt-1">{errors.rut}</p>}
              </div>

              {/* Industria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industria / Rubro
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={submitting || loading}
                >
                  <option value="">Selecciona una industria</option>
                  <option value="construccion">Construcción</option>
                  <option value="manufactura">Manufactura</option>
                  <option value="retail">Retail</option>
                  <option value="tecnologia">Tecnología</option>
                  <option value="salud">Salud</option>
                  <option value="educacion">Educación</option>
                  <option value="agricola">Agrícola</option>
                  <option value="mineria">Minería</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Número de Empleados */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Empleados
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="employees_count"
                    value={formData.employees_count}
                    onChange={handleChange}
                    placeholder="Ej: 50"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.employees_count ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting || loading}
                  />
                </div>
                {errors.employees_count && (
                  <p className="text-red-500 text-sm mt-1">{errors.employees_count}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@empresa.cl"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting || loading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56912345678"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting || loading}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.empresa.cl"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting || loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
            <div className="space-y-4">
              
              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle Principal 123, Piso 4"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={submitting || loading}
                  />
                </div>
              </div>

              {/* Ciudad y Región */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ej: Santiago"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting || loading}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Región *
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.region ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting || loading}
                  >
                    <option value="">Selecciona región</option>
                    <option value="I">Región de Arica y Parinacota</option>
                    <option value="II">Región de Tarapacá</option>
                    <option value="III">Región de Antofagasta</option>
                    <option value="IV">Región de Atacama</option>
                    <option value="V">Región de Coquimbo</option>
                    <option value="VI">Región de Valparaíso</option>
                    <option value="VII">Región del Libertador General Bernardo O'Higgins</option>
                    <option value="VIII">Región del Maule</option>
                    <option value="IX">Región de La Araucanía</option>
                    <option value="X">Región de Los Ríos</option>
                    <option value="XI">Región de Los Lagos</option>
                    <option value="XII">Región de Aysén</option>
                    <option value="XIII">Región de Magallanes y de la Antártica Chilena</option>
                    <option value="XIV">Región de O'Higgins</option>
                    <option value="XV">Región Metropolitana de Santiago</option>
                    <option value="XVI">Región de Ñuble</option>
                  </select>
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción / Notas
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Información adicional sobre tu empresa..."
                  rows={4}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  disabled={submitting || loading}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting || loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {(submitting || loading) && <Loader className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Actualizar' : 'Crear'} Empresa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
