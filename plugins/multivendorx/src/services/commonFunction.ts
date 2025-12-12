// export function formatCurrency(amount: number | string): string {
//   if (!amount && amount !== 0) return '-';

//   const {
//     currency_symbol = '',
//     price_format = '%1$s%2$s',
//     decimal_sep = '.',
//     thousand_sep = ',',
//     decimals = 2,
//   } = appLocalizer || {};

//   const num = parseFloat(String(amount));
//   if (isNaN(num)) return '-';

//   const formattedNumber = num
//     .toFixed(decimals)
//     .replace('.', decimal_sep)
//     .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep);

//   return price_format
//     .replace('%1$s', currency_symbol)
//     .replace('%2$s', formattedNumber)
//     .replace(/&nbsp;/g, ' ')
//     .trim();
// }

export function formatCurrency(amount: number | string): string {
	if (!amount && amount !== 0) {
		return '-';
	}

	const {
		currency_symbol = '',
		price_format = '%1$s%2$s',
		decimal_sep = '.',
		thousand_sep = ',',
		decimals = 2,
	} = appLocalizer || {};

	const num = parseFloat(String(amount));
	if (isNaN(num)) {
		return '-';
	}

	const isNegative = num < 0;
	const absNum = Math.abs(num);

	const formattedNumber = absNum
		.toFixed(decimals)
		.replace('.', decimal_sep)
		.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep);

	//Apply symbol & number
	let formatted = price_format
		.replace('%1$s', currency_symbol)
		.replace('%2$s', formattedNumber)
		.replace(/&nbsp;/g, ' ')
		.trim();

	//For negative numbers, show as "-$271" instead of "$-271"
	if (isNegative) {
		formatted = `-${formatted.replace('-', '')}`;
	}

	return formatted;
}

export const formatWcShortDate = (dateString: any) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
};

export function formatTimeAgo(dateString: any) {
	const date = new Date(dateString.replace(' ', 'T'));
	const diff = (Date.now() - date.getTime()) / 1000;

	if (diff < 60) {
		return 'just now';
	}
	if (diff < 3600) {
		return Math.floor(diff / 60) + 'm ago';
	}
	if (diff < 86400) {
		return Math.floor(diff / 3600) + 'h ago';
	}
	return Math.floor(diff / 86400) + 'd ago';
}
