export function formatCurrency(amount: number | string): string {
  if (!amount && amount !== 0) return '-';

  const {
    currency_symbol = '',
    price_format = '%1$s%2$s',
    decimal_sep = '.',
    thousand_sep = ',',
    decimals = 2,
  } = appLocalizer || {};

  const num = parseFloat(String(amount));
  if (isNaN(num)) return '-';

  const formattedNumber = num
    .toFixed(decimals)
    .replace('.', decimal_sep)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep);

  return price_format
    .replace('%1$s', currency_symbol)
    .replace('%2$s', formattedNumber)
    .replace(/&nbsp;/g, ' ')
    .trim();
}
