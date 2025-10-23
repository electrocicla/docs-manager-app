import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gestionar el dismissal del panel informativo
 * Usa localStorage para recordar si el usuario lo cerró permanentemente
 */
export function useInfoPanelDismiss(storageKey: string = 'sr-info-panel-dismissed') {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar estado del localStorage al montar
  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey) === 'true';
    setIsDismissed(dismissed);
    setIsLoading(false);
  }, [storageKey]);

  // Dismissar el panel permanentemente
  const dismissPanel = () => {
    localStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
  };

  // Reset (para testing o si el usuario quiere ver el panel de nuevo)
  const resetPanel = () => {
    localStorage.removeItem(storageKey);
    setIsDismissed(false);
  };

  return {
    isDismissed,
    isLoading,
    dismissPanel,
    resetPanel,
  };
}
