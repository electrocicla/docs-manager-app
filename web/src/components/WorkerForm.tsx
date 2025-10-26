import { useState, useEffect } from 'react';
import { X, Loader, User, Mail, Phone, Briefcase, MapPin } from 'lucide-react';
import type { Worker, WorkerInput } from '../types/company';
import { formatRutInput, isValidRut, normalizeRut } from '../utils/rut';

interface WorkerFormProps {
  companyId: string;
  worker?: Worker;
  onSubmit: (data: WorkerInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface WorkerFormState {
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  additional_comments: string;
}

const INITIAL_STATE: WorkerFormState = {
  first_name: '',
  last_name: '',
  rut: '',
  email: '',
  phone: '',
  job_title: '',
  department: '',
  additional_comments: '',
};

export default function WorkerForm({
  companyId,
  worker,
  onSubmit,
  onCancel,
  loading = false,
}: WorkerFormProps) {
  const [formData, setFormData] = useState<WorkerFormState>(INITIAL_STATE);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos del trabajador si estamos editando
  useEffect(() => {
    if (worker) {
      setFormData({
        first_name: worker.first_name || '',
        last_name: worker.last_name || '',
        rut: formatRutInput(worker.rut || ''),
        email: worker.email || '',
        phone: worker.phone || '',
        job_title: worker.job_title || '',
        department: worker.department || '',
        additional_comments: worker.additional_comments || '',
      });
    }
  }, [worker]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!isValidRut(formData.rut)) {
      newErrors.rut = 'Formato de RUT inválido (ej: 12.345.678-K)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
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
      const dataToSubmit: WorkerInput = {
        company_id: companyId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        rut: normalizeRut(formData.rut),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        job_title: formData.job_title.trim() || undefined,
        department: formData.department.trim() || undefined,
        additional_comments: formData.additional_comments.trim() || undefined,
      };

      await onSubmit(dataToSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!worker;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
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
          
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="space-y-4">
              
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Juan"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={submitting || loading}
                    />
                  </div>
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting || loading}
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                </div>
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
                    placeholder="juan.perez@empresa.cl"
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
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
            <div className="space-y-4">
              
              {/* Puesto y Departamento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puesto / Cargo
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="Ej: Ingeniero de Seguridad"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={submitting || loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Ej: Prevención de Riesgos"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={submitting || loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios Adicionales
            </label>
            <textarea
              name="additional_comments"
              value={formData.additional_comments}
              onChange={handleChange}
              placeholder="Información adicional sobre el trabajador..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              disabled={submitting || loading}
            />
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
              <span>{isEditing ? 'Actualizar' : 'Crear'} Trabajador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
