import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/services/commonFunction';

interface Row {
	description: string;
	qty?: number | string;
	price?: string;
	amount?: string;
}

interface Props {
	invoiceRows?: Row[];
	order?: any;
	colors?: {
		colorPrimary: string;
		colorSecondary: string;
		colorAccent: string;
		colorSupport: string;
	};
}

const StoreInvoicePDF: React.FC<Props> = ({ invoiceRows, colors, order }) => {
	const rows: Row[] = invoiceRows || [
		{
			description: 'Website Design & Development',
			qty: 1,
			price: '$3,500.00',
			amount: '$3,500.00',
		},
		{
			description: 'Hosting & Maintenance (1 Year)',
			qty: 1,
			price: '$800.00',
			amount: '$800.00',
		},
		{
			description: 'Content Optimization',
			qty: 1,
			price: '$350.00',
			amount: '$350.00',
		},
		{ description: 'Discount', qty: ' ', price: ' ', amount: '−$150.00' },
	];

	const subtotal = (order?.total || 0) - (order?.total_tax || 0) - (order?.shipping_total || 0);
	const dueDays = appLocalizer.settings_databases_value?.invoices?.due_days;

	const calculateDueDate = (dateString?: string, days?: number) => {
		if (!dateString || !days) return null;

		const date = new Date(dateString);
		date.setDate(date.getDate() + days);
		return formatDate(date.toISOString());
	};

	return (
		<Document>
			<Page
				size="A4"
				style={{
					fontSize: 12,
					fontFamily: 'Helvetica',
					backgroundColor: '#fff',
					position: 'relative',
				}}
			>
				<View>
					{/* header start*/}
					<View
						id="invoice-header"
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							flexDirection: 'row',
							margin: '20px',
							paddingBottom: '20px',
							borderBottom: '1px solid #eee',
						}}
					>
						{/* left section */}
						<View
							id="invoice-header-left"
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								gap: 15,
								flexDirection: 'row',
								alignItems: 'flex-start',
							}}
						>
							<View
								style={{
									padding: 10,
									backgroundColor: colors?.colorPrimary,
									fontSize: 25,
									fontWeight: 600,
									borderRadius: 4,
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Text style={{ color: '#fff' }}>MK</Text>
							</View>
							<View
								style={{
									display: 'flex',
									gap: 5,
									flexDirection: 'column',
								}}
							>
								<Text
									id="store-name"
									style={{ fontSize: 20, fontWeight: 600 }}
								>
									{order?.store_name || 'MarketKit Ltd.'}
								</Text>
								<Text id="address">
									{order?.store_address || '123 Elm Street, Suite 400'}
								</Text>
								<Text id="phone">
									{order?.store_phone || '(555) 555-0123'}
								</Text>
							</View>
						</View>{' '}
						{/* left section end*/}
						{/* right section */}
						<View
							id="invoice-header-right"
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-end',
								gap: 6,
							}}
						>
							<Text
								style={{
									fontSize: 20,
									fontWeight: 600,
								}}
							>
								Invoice
							</Text>

							<Text style={{ fontSize: 12, color: '#555' }}>
								Invoice #:{' '}
								<Text style={{ fontWeight: 600 }}>
									{appLocalizer.settings_databases_value?.invoices?.['invoice_prefix'] || 'INV-2025-'}{order?.id || '091'}
								</Text>
							</Text>

							<Text style={{ fontSize: 12, color: '#555' }}>
								Issued:{' '}
								<Text style={{ fontWeight: 600 }}>
									{order?.date_created ? formatDate(order.date_created) : 'October 9, 2025'}
								</Text>
							</Text>

							{dueDays ? (
								<Text style={{ fontSize: 12, color: '#555' }}>
									Due:{' '}
									<Text style={{ fontWeight: 600 }}>
										{calculateDueDate(order?.date_created, Number(dueDays))}
									</Text>
								</Text>
							) : null}

							<View
								style={{
									marginTop: 8,
									padding: '4px 8px',
									backgroundColor: '#fde68a',
									borderRadius: 5,
								}}
							>
								<Text
									style={{
										fontSize: 10,
										fontWeight: 600,
										color: '#92400e',
									}}
								>
									{order?.paid_status == true ? 'Paid' : 'Unpaid'}
								</Text>
							</View>
						</View>{' '}
						{/* right section end */}
					</View>
					{/* header end*/}

					{/* billing section start */}
					<View
						id="billing-section"
						style={{
							margin: '0 20px',
							marginTop: '0',
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							gap: '20px',
						}}
					>
						<View
							id="left-details"
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
								width: '100%',
								padding: '10px',
								backgroundColor: '#f0f0f0',
								border: '1px solid #ccc',
								borderRadius: '5px',
							}}
						>
							<Text style={{ fontSize: '12px' }}>Bill To</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.billing?.first_name && order?.billing?.last_name ? `${order.billing.first_name} ${order.billing.last_name}` : 'Jane Doe'}
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.billing?.address_1 || '456 Oak Avenue'}
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.billing?.city && order?.billing?.state && order?.billing?.postcode
									? `${order.billing.city}, ${order.billing.state} ${order.billing.postcode}`
									: 'Springfield, IL 62701'}
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.billing?.email || 'jane.doe@acme.co'}
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.billing?.phone || '(555) 987-6543'}
							</Text>
						</View>

						<View
							id="left-details"
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '5px',
								width: '100%',
								padding: '10px',
								backgroundColor: '#f0f0f0',
								border: '1px solid #ccc',
								borderRadius: '5px',
							}}
						>
							<Text style={{ fontSize: '12px' }}>Ship To</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.shipping?.address_1 || '789 Distribution Road'}
							</Text>
							<Text style={{ fontSize: '10px' }}>
								{order?.shipping?.city && order?.shipping?.state && order?.shipping?.postcode
									? `${order.shipping.city}, ${order.shipping.state} ${order.shipping.postcode}`
									: 'Springfield, IL 62702'}
							</Text>
						</View>
					</View>
					{/* billing section end */}

					{/* table section start */}
					<View
						id="invoice-table-wrapper"
						style={{
							margin: '20px',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<View
							id="invoice-table-header"
							style={{
								display: 'flex',
								flexDirection: 'row',
								paddingVertical: 8,
							}}
						>
							{/* Description */}
							<View style={{ flex: 4 }}>
								<Text style={{ fontWeight: 600 }}>
									Description
								</Text>
							</View>

							{/* Qty */}
							<Text
								style={{
									flex: 1,
									textAlign: 'center',
									fontWeight: 600,
								}}
							>
								Qty
							</Text>

							{/* Unit Price */}
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Price
							</Text>

							{/* Amount */}
							<Text
								style={{
									flex: 2,
									textAlign: 'right',
									fontWeight: 600,
								}}
							>
								Amount
							</Text>
						</View>
						{rows.map((row, index) => {
							return (
								<View
									id="invoice-table-row"
									key={index}
									style={{
										display: 'flex',
										flexDirection: 'row',
										paddingVertical: 8,
										borderTop: '1px solid #eee',
									}}
								>
									{/* Description */}
									<View style={{ flex: 4 }}>
										<Text>{row.description}</Text>
									</View>

									{/* Qty */}
									<Text
										style={{ flex: 1, textAlign: 'center' }}
									>
										{row.qty}
									</Text>

									{/* Unit Price */}
									<Text
										style={{ flex: 2, textAlign: 'right' }}
									>
										{row.price}
									</Text>

									{/* Amount */}
									<Text
										style={{
											flex: 2,
											textAlign: 'right',
										}}
									>
										{row.amount}
									</Text>
								</View>
							);
						})}
					</View>
					{/* table section end  */}

					{/* total section start */}
					<View
						id="total-section"
						style={{
							margin: '20px',
							marginTop: '10px',
							display: 'flex',
							justifyContent: 'flex-end',
						}}
					>
						<View
							style={{
								border: '1px solid #ccc',
								borderRadius: '5px',
								padding: '10px',
								backgroundColor: '#f9f9f9',
								width: '40%',
								alignSelf: 'flex-end',
								marginLeft: 'auto',
							}}
						>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Subtotal:
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									{subtotal? formatCurrency(subtotal) : '$4,500.00'}
								</Text>
							</View>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Total Tax :
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									{order?.total_tax ? formatCurrency(order?.total_tax) : '$1,000.00'}
								</Text>
							</View>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginBottom: '8px',
								}}
							>
								<Text style={{ fontSize: '12px' }}>
									Shipping:
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									{order?.shipping_total ? formatCurrency(order?.shipping_total) : '$0.00'}
								</Text>
							</View>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
									}}
								>
									Total :
								</Text>
								<Text
									style={{
										fontSize: '12px',
										fontWeight: 'bold',
										marginLeft: '10px',
									}}
								>
									{order?.total ? formatCurrency(order?.total) : '$5,500.00'}
								</Text>
							</View>
						</View>
					</View>
					{/* total section end */}

					{/* note section start */}
					<View
						style={{
							paddingTop: '20px',
							display: 'flex',
							justifyContent: 'center',
							borderTop: '1px solid #eee',
							margin: '20px',
						}}
					>
						<Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
							Notes:{' '}
							<Text style={{ fontSize: '10px' }}>
								Thank you for your business. Please make payment
								within 14 days. Late payments may incur
								additional fees.
							</Text>
						</Text>
					</View>
					{/* note section end */}
				</View>
			</Page>
		</Document>
	);
};

export default StoreInvoicePDF;
