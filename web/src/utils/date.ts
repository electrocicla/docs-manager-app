const DEFAULT_LOCALE = 'es-CL';

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const DEFAULT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DEFAULT_DATE_OPTIONS,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

const toDate = (value: Date | string): Date | null => {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatWithOptions = (
  value: Date | string,
  options: Intl.DateTimeFormatOptions,
  locale: string,
): string => {
  const date = toDate(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatDate = (
  value: Date | string,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = DEFAULT_LOCALE,
): string => {
  return formatWithOptions(value, { ...DEFAULT_DATE_OPTIONS, ...options }, locale);
};

export const formatDateTime = (
  value: Date | string,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = DEFAULT_LOCALE,
): string => {
  return formatWithOptions(value, { ...DEFAULT_DATE_TIME_OPTIONS, ...options }, locale);
};
