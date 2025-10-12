import { useParams } from 'react-router-dom';
import { FormularioCotizacion } from '../components/FormularioCotizacion';

export default function CotizarTrabajo() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Trabajo no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FormularioCotizacion trabajoId={id} />
    </div>
  );
}