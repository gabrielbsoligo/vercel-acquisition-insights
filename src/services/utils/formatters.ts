
/**
 * Format currency values to Brazilian Real (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format percentage values with 1 decimal place
 */
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
