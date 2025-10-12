import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  checks: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Evalúa la fortaleza de una contraseña
 */
export function evaluatePasswordStrength(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  // Calcular score (0-5)
  const score = Object.values(checks).filter(Boolean).length;

  // Determinar fortaleza
  let strength: PasswordValidation['strength'];
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';

  return {
    isValid: checks.minLength,
    strength,
    score,
    checks,
  };
}

/**
 * Componente para mostrar la fortaleza de la contraseña
 * con indicadores visuales y requisitos
 */
export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const validation = useMemo(() => evaluatePasswordStrength(password), [password]);

  if (!password) return null;

  const strengthColors = {
    'weak': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'strong': 'bg-blue-500',
    'very-strong': 'bg-green-500',
  };

  const strengthLabels = {
    'weak': 'Débil',
    'medium': 'Media',
    'strong': 'Fuerte',
    'very-strong': 'Muy Fuerte',
  };

  const strengthTextColors = {
    'weak': 'text-red-700',
    'medium': 'text-yellow-700',
    'strong': 'text-blue-700',
    'very-strong': 'text-green-700',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barra de fortaleza */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            Fortaleza de la contraseña
          </span>
          <span className={`text-sm font-semibold ${strengthTextColors[validation.strength]}`}>
            {strengthLabels[validation.strength]}
          </span>
        </div>
        <div className="flex gap-1 h-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-colors duration-300 ${
                level <= validation.score
                  ? strengthColors[validation.strength]
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requisitos */}
      <div className="space-y-1">
        <RequirementItem
          met={validation.checks.minLength}
          text="Mínimo 8 caracteres"
        />
        <RequirementItem
          met={validation.checks.hasUpperCase}
          text="Una letra mayúscula"
        />
        <RequirementItem
          met={validation.checks.hasLowerCase}
          text="Una letra minúscula"
        />
        <RequirementItem
          met={validation.checks.hasNumber}
          text="Un número"
        />
        <RequirementItem
          met={validation.checks.hasSpecialChar}
          text="Un carácter especial (!@#$%^&*)"
        />
      </div>
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>
        {text}
      </span>
    </div>
  );
}
