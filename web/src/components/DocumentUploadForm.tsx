import { useState } from 'react';
import { X, Loader, Upload, FileText, Calendar } from 'lucide-react';
import type { WorkerDocumentType } from '../types/company';

interface DocumentUploadFormProps {
  documentTypes: WorkerDocumentType[];
  onSubmit: (data: {
    document_type_id: string;
    emission_date?: string;
    expiry_date?: string;
    file: File;
    file_back?: File;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function DocumentUploadForm({
  documentTypes,
  onSubmit,
  onCancel,
  loading = false,
}: DocumentUploadFormProps) {
  const [formData, setFormData] = useState({
    document_type_id: '',
    emission_date: '',
    expiry_date: '',
  });

  const [files, setFiles] = useState<{
    front?: File;
    back?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedDocType = documentTypes.find(dt => dt.id === formData.document_type_id);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.document_type_id) {
      newErrors.document_type_id = 'Debe seleccionar un tipo de documento';
    }

    if (!files.front) {
      newErrors.front = 'Debe subir un archivo (frente)';
    }

    if (selectedDocType?.requires_front_back && !files.back) {
      newErrors.back = 'Este documento requiere imagen de dorso';
    }

    if (formData.emission_date && isNaN(new Date(formData.emission_date).getTime())) {
      newErrors.emission_date = 'Fecha inválida';
    }

    if (formData.expiry_date && isNaN(new Date(formData.expiry_date).getTime())) {
      newErrors.expiry_date = 'Fecha inválida';
    }

    if (
      formData.emission_date &&
      formData.expiry_date &&
      new Date(formData.emission_date) >= new Date(formData.expiry_date)
    ) {
      newErrors.expiry_date = 'La fecha de vencimiento debe ser posterior a la de emisión';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docTypeId = e.target.value;
    setFormData(prev => ({
      ...prev,
      document_type_id: docTypeId,
    }));
    if (errors.document_type_id) {
      setErrors(prev => ({
        ...prev,
        document_type_id: '',
      }));
    }
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'emission_date' | 'expiry_date'
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [side]: file,
      }));
      if (errors[side]) {
        setErrors(prev => ({
          ...prev,
          [side]: '',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        document_type_id: formData.document_type_id,
        emission_date: formData.emission_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        file: files.front!,
        file_back: files.back,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Subir Documento</h2>
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
          
          {/* Tipo de Documento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Documento</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                value={formData.document_type_id}
                onChange={handleDocumentTypeChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.document_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting || loading}
              >
                <option value="">-- Selecciona un tipo de documento --</option>
                {documentTypes.map(docType => (
                  <option key={docType.id} value={docType.id}>
                    {docType.name}
                    {docType.requires_front_back ? ' (frente + dorso)' : ''}
                  </option>
                ))}
              </select>
              {errors.document_type_id && (
                <p className="text-red-500 text-sm mt-1">{errors.document_type_id}</p>
              )}
              {selectedDocType && (
                <p className="text-gray-600 text-sm mt-2">{selectedDocType.description}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          {selectedDocType?.requires_expiry_date && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas del Documento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Emisión
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.emission_date}
                      onChange={(e) => handleDateChange(e, 'emission_date')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={submitting || loading}
                    />
                  </div>
                  {errors.emission_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.emission_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleDateChange(e, 'expiry_date')}
                      required={selectedDocType?.requires_expiry_date}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.expiry_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={submitting || loading}
                    />
                  </div>
                  {errors.expiry_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload de Archivos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjuntar Documentos</h3>
            <div className="space-y-4">
              
              {/* Frente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frente del Documento *
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'front')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={submitting || loading}
                  />
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {files.front ? (
                      <div>
                        <p className="font-medium text-gray-900">{files.front.name}</p>
                        <p className="text-sm text-gray-600">
                          {(files.front.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-700">Arrastra o haz clic para seleccionar</p>
                        <p className="text-sm text-gray-600">PNG, JPG, PDF (máx. 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.front && <p className="text-red-500 text-sm mt-1">{errors.front}</p>}
              </div>

              {/* Dorso (si aplica) */}
              {selectedDocType?.requires_front_back && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dorso del Documento *
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={submitting || loading}
                    />
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {files.back ? (
                        <div>
                          <p className="font-medium text-gray-900">{files.back.name}</p>
                          <p className="text-sm text-gray-600">
                            {(files.back.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-700">Arrastra o haz clic para seleccionar</p>
                          <p className="text-sm text-gray-600">PNG, JPG, PDF (máx. 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.back && <p className="text-red-500 text-sm mt-1">{errors.back}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> Los documentos serán enviados para revisión. Un administrador deberá aprobarlos antes de que sean considerados válidos.
            </p>
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
              disabled={submitting || loading || !formData.document_type_id}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {(submitting || loading) && <Loader className="w-4 h-4 animate-spin" />}
              <span>Subir Documento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
