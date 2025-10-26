const MULTIPLIERS_SEQUENCE = [2, 3, 4, 5, 6, 7] as const;

const cleanRutValue = (rut: string): string => rut.replace(/[^0-9kK]/g, '').toUpperCase();

const calculateVerificationDigit = (numericPart: string): string => {
  let sum = 0;
  let multiplierIndex = 0;

  for (let i = numericPart.length - 1; i >= 0; i -= 1) {
    sum += Number(numericPart[i]) * MULTIPLIERS_SEQUENCE[multiplierIndex];
    multiplierIndex = (multiplierIndex + 1) % MULTIPLIERS_SEQUENCE.length;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) {
    return '0';
  }

  if (remainder === 10) {
    return 'K';
  }

  return String(remainder);
};

export const isValidRut = (rut: string): boolean => {
  const cleaned = cleanRutValue(rut);

  if (cleaned.length < 2) {
    return false;
  }

  const numericPart = cleaned.slice(0, -1);
  const verificationDigit = cleaned.slice(-1);

  if (!/^\d+$/.test(numericPart)) {
    return false;
  }

  return calculateVerificationDigit(numericPart) === verificationDigit;
};

export const formatRut = (rut: string): string => {
  const cleaned = cleanRutValue(rut);

  if (cleaned.length <= 1) {
    return cleaned;
  }

  const numericPart = cleaned.slice(0, -1);
  const verificationDigit = cleaned.slice(-1);

  const reversed = numericPart.split('').reverse();
  const grouped = [] as string[];

  for (let i = 0; i < reversed.length; i += 1) {
    grouped.push(reversed[i]);

    if ((i + 1) % 3 === 0 && i + 1 < reversed.length) {
      grouped.push('.');
    }
  }

  const formattedNumericPart = grouped.reverse().join('');

  return `${formattedNumericPart}-${verificationDigit}`;
};

export const formatRutInput = (rut: string): string => {
  const cleaned = cleanRutValue(rut);

  if (cleaned.length <= 1) {
    return cleaned;
  }

  return formatRut(cleaned);
};
