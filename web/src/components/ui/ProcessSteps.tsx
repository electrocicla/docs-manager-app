import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon?: ReactNode;
  completed?: boolean;
}

interface ProcessStepsProps {
  steps: StepProps[];
  title?: string;
  description?: string;
}

/**
 * Componente para mostrar procesos paso a paso
 * Útil para guiar al usuario a través de flujos de trabajo
 */
export function ProcessSteps({ steps, title, description }: ProcessStepsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            {/* Número de paso o ícono */}
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                step.completed 
                  ? 'bg-green-600' 
                  : index === 0 
                    ? 'bg-primary-600' 
                    : 'bg-gray-400'
              }`}>
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  step.number
                )}
              </div>
            </div>
            
            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
            
            {/* Línea conectora (excepto último) */}
            {index < steps.length - 1 && (
              <div className="absolute left-[44px] mt-12 w-0.5 h-10 bg-gray-300" style={{ marginLeft: '0px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
