import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

type Row = {
    seller: string;
    product: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    tax: number;
    total: number;
};

interface Props {
    invoiceRows?: Row[];
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
}

const customerInvoice2: React.FC<Props> = ({ invoiceRows, colors }) => {
    const rows: Row[] = invoiceRows || [
        {
            seller: 'Premium Electronics',
            product: 'Widget A - Premium Edition',
            qty: 2,
            unitPrice: 50,
            subtotal: 100,
            tax: 10,
            total: 110,
        },
        {
            seller: 'Premium Electronics',
            product: 'Widget B - Deluxe Model',
            qty: 1,
            unitPrice: 75,
            subtotal: 75,
            tax: 7.5,
            total: 82.5,
        },
        {
            seller: 'Tech Accessories Co',
            product: 'Premium USB Cable',
            qty: 2,
            unitPrice: 15,
            subtotal: 30,
            tax: 3,
            total: 33,
        },
    ];

    // Create dynamic styles based on colors
    const createStyles = (colors: Props['colors']) => StyleSheet.create({
        page: {
            fontSize: 12,
            fontFamily: 'Helvetica',
            backgroundColor: '#fff',
            position: 'relative',
        },
        // Header styles
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            margin: 20,
            paddingBottom: 20,
            borderBottom: '0.063rem solid #eee',
        },
        headerLeft: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: 15,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        logoBox: {
            padding: 10,
            backgroundColor: colors.colorPrimary,
            fontSize: 25,
            fontWeight: 600,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logoText: {
            color: '#fff',
        },
        companyDetails: {
            display: 'flex',
            gap: 5,
            flexDirection: 'column',
        },
        companyName: {
            fontSize: 18,
            fontWeight: 600,
        },
        addressText: {
            fontSize: 12,
            color: '#555',
        },
        labelText: {
            fontSize: 12,
            color: '#555',
        },
        boldText: {
            fontWeight: 600,
        },
        headerRight: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
        },
        invoiceTitle: {
            fontSize: 18,
            fontWeight: 600,
        },
        statusBadge: {
            marginTop: 8,
            padding: '0.25rem 0.5rem',
            backgroundColor: '#33920e69',
            borderRadius: 5,
        },
        statusText: {
            fontSize: 10,
            fontWeight: 600,
            color: '#33920eff',
        },
        // Billing section styles
        billingSection: {
            margin: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 20,
        },
        billingCard: {
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            width: '100%',
            padding: 10,
            backgroundColor: '#f0f0f0',
            border: '0.063rem solid #ccc',
            borderRadius: 5,
        },
        billingTitle: {
            fontSize: 14,
            color: colors.colorPrimary,
            marginBottom: 5,
            fontWeight: 'bold',
        },
        vendorName: {
            fontSize: 12,
            fontWeight: 'bold',
        },
        billingEmail: {
            fontSize: 10,
        },
        billingAddress: {
            fontSize: 10,
        },
        // Table styles
        tableWrapper: {
            margin: 20,
            display: 'flex',
            flexDirection: 'column',
        },
        tableHeader: {
            display: 'flex',
            flexDirection: 'row',
            paddingVertical: 8,
        },
        tableRow: {
            display: 'flex',
            flexDirection: 'row',
            paddingVertical: 8,
            borderTop: '0.063rem solid #eee',
        },
        headerCell: {
            fontWeight: 600,
        },
        flex4: { flex: 4 },
        flex2: { flex: 2, textAlign: 'right' as const },
        // Total section styles
        totalSection: {
            margin: 20,
            marginTop: 10,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 20,
            flexDirection: 'row',
        },
        totalCard: {
            border: '0.063rem solid #ccc',
            borderRadius: 5,
            padding: 10,
            backgroundColor: '#f9f9f9',
            width: '50%',
            alignSelf: 'flex-end',
        },
        totalHeader: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottom: '0.063rem solid #ccc',
            paddingBottom: 8,
            marginBottom: 8,
        },
        totalHeaderText: {
            fontSize: 12,
            fontWeight: 'bold',
        },
        totalRow: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        totalLabel: {
            fontSize: 12,
        },
        totalValue: {
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 10,
        },
        // Tax information styles
        taxInfoSection: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            padding: 10,
            backgroundColor: '#f9f9f9',
            margin: 20,
            border: '0.063rem solid #ccc',
            borderRadius: 5,
        },
        taxInfoColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
        },
        taxInfoLabel: {
            fontSize: 10,
        },
        taxInfoValue: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        paymentStatus: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#1bc006ff',
            backgroundColor: '#00ff221f',
            padding: '0.125rem 0.375rem',
            borderRadius: 3,
            textAlign: 'center' as const,
        },
        totalPaid: {
            fontSize: 10,
            fontWeight: 'bold',
            color: colors.colorPrimary,
        },
        // Note section styles
        noteSection: {
            padding: 10,
            display: 'flex',
            justifyContent: 'center',
            borderLeft: `0.188rem solid ${colors.colorPrimary}`,
            margin: 20,
            backgroundColor: '#f9f9f9',
        },
        noteTitle: {
            fontSize: 12,
            fontWeight: 'bold',
        },
        noteText: {
            fontSize: 10,
        },
    });

    const styles = createStyles(colors);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    {/* header start*/}
                    <View id="invoice-header" style={styles.header}>
                        {/* left section */}
                        <View id="invoice-header-left" style={styles.headerLeft}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoText}>MS</Text>
                            </View>
                            <View style={styles.companyDetails}>
                                <Text id="company-name" style={styles.companyName}>
                                    Marketplace Solutions Inc.
                                </Text>
                                <Text id="address" style={styles.addressText}>
                                    789 Commerce Boulevard, Suite 500
                                </Text>
                                <Text id="address" style={styles.addressText}>
                                    San Francisco, CA 94102, United States
                                </Text>
                                <Text style={styles.labelText}>
                                    Tax ID:{' '}
                                    <Text style={styles.boldText}>
                                        US-TAX-123456789
                                    </Text>
                                </Text>
                                <Text style={styles.labelText}>
                                    GST/VAT Number:{' '}
                                    <Text style={styles.boldText}>
                                        GST-US-987654321
                                    </Text>
                                </Text>
                                <Text style={styles.labelText}>
                                    Business Registration:{' '}
                                    <Text style={styles.boldText}>
                                        BRN-2020-MKT-4567
                                    </Text>
                                </Text>
                            </View>
                        </View>{' '}
                        {/* left section end*/}
                        {/* right section */}
                        <View id="invoice-header-right" style={styles.headerRight}>
                            <Text style={styles.invoiceTitle}>
                                Marketplace Order Invoice
                            </Text>

                            <Text style={styles.labelText}>
                                Invoice #:{' '}
                                <Text style={styles.boldText}>
                                    ADMIN-ORD-2026-0001
                                </Text>
                            </Text>

                            <Text style={styles.labelText}>
                                Date:{' '}
                                <Text style={styles.boldText}>
                                    22 Jan 2026
                                </Text>
                            </Text>

                            <Text style={styles.labelText}>
                                Order Number:{' '}
                                <Text style={styles.boldText}>
                                    ORD-20260122-101
                                </Text>
                            </Text>
                            <Text style={styles.labelText}>
                                Order Date:{' '}
                                <Text style={styles.boldText}>
                                    22 Jan 2026
                                </Text>
                            </Text>

                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    Completed
                                </Text>
                            </View>
                        </View>{' '}
                        {/* right section end */}
                    </View>
                    {/* header end*/}

                    {/* billing section start */}
                    <View id="billing-section" style={styles.billingSection}>
                        <View id="left-details" style={styles.billingCard}>
                            <Text style={styles.billingTitle}>
                                Artisan Market Co.
                            </Text>
                            <Text style={styles.vendorName}>
                                Vendor Rajan Mehta
                            </Text>
                            <Text style={styles.billingEmail}>
                                {' '}
                                <Text style={styles.boldText}>
                                    Email:{' '}
                                </Text>
                                john.smith@email.com
                            </Text>
                            <Text style={styles.billingAddress}>
                                42 Commerce Lane, Suite 5, Mumbai 400001, India
                            </Text>
                        </View>
                         <View id="left-details" style={styles.billingCard}>
                            <Text style={styles.billingTitle}>
                                Artisan Market Co.
                            </Text>
                            <Text style={styles.vendorName}>
                                Vendor Rajan Mehta
                            </Text>
                            <Text style={styles.billingEmail}>
                                {' '}
                                <Text style={styles.boldText}>
                                    Email:{' '}
                                </Text>
                                john.smith@email.com
                            </Text>
                            <Text style={styles.billingAddress}>
                                42 Commerce Lane, Suite 5, Mumbai 400001, India
                            </Text>
                        </View>

                         <View id="left-details" style={styles.billingCard}>
                            <Text style={styles.billingTitle}>
                                Artisan Market Co.
                            </Text>
                            <Text style={styles.vendorName}>
                                Vendor Rajan Mehta
                            </Text>
                            <Text style={styles.billingEmail}>
                                {' '}
                                <Text style={styles.boldText}>
                                    Email:{' '}
                                </Text>
                                john.smith@email.com
                            </Text>
                            <Text style={styles.billingAddress}>
                                42 Commerce Lane, Suite 5, Mumbai 400001, India
                            </Text>
                        </View>
                    </View>
                    {/* billing section end */}

                    {/* table section start */}
                    <View id="invoice-table-wrapper" style={styles.tableWrapper}>
                        <View id="invoice-table-header" style={styles.tableHeader}>
                            <View style={styles.flex4}>
                                <Text style={styles.headerCell}>
                                    Order ID
                                </Text>
                            </View>

                            <Text style={styles.flex2}>
                                Date
                            </Text>
                            <Text style={styles.flex2}>
                                Products
                            </Text>
                            <Text style={styles.flex2}>
                                Order total
                            </Text>
                            <Text style={styles.flex2}>
                                Marketplace Commission
                            </Text>
                            <Text style={styles.flex2}>
                                Vendor earnings
                            </Text>
                        </View>
                        {rows.map((row, index) => {
                            return (
                                <View
                                    id="invoice-table-row"
                                    key={index}
                                    style={styles.tableRow}
                                >
                                    <View style={styles.flex4}>
                                        <Text>{row.seller}</Text>
                                    </View>

                                    <Text style={styles.flex2}>
                                        {row.product}
                                    </Text>

                                    <Text style={styles.flex2}>
                                        {row.qty}
                                    </Text>
                                    <Text style={styles.flex2}>
                                        {row.unitPrice}
                                    </Text>
                                    <Text style={styles.flex2}>
                                        {row.subtotal}
                                    </Text>
                                    <Text style={styles.flex2}>
                                        {row.tax}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    {/* table section end  */}

                    {/* total section start */}
                    <View id="total-section" style={styles.totalSection}>
                        <View style={styles.totalCard}>
                            <View style={styles.totalHeader}>
                                <Text style={styles.totalHeaderText}>
                                    Settlement summary
                                </Text>
                            </View>

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    Total sales:
                                </Text>
                                <Text style={styles.totalValue}>
                                    $20.50
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    Commission (15%):
                                </Text>
                                <Text style={styles.totalValue}>
                                    $5.00
                                </Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    Platform fee:
                                </Text>
                                <Text style={styles.totalValue}>
                                    $7.50
                                </Text>
                            </View>
                        </View>
                    </View>
                    {/* total section end */}

                    {/* tax information */}
                    <View id="tax-information" style={styles.taxInfoSection}>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Payment Method
                            </Text>
                            <Text style={styles.taxInfoValue}>
                                Credit Card ****5678
                            </Text>
                        </View>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Transaction ID
                            </Text>
                            <Text style={styles.taxInfoValue}>
                                TXN-20260122-ABC123
                            </Text>
                        </View>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Payment Reference
                            </Text>
                            <Text style={styles.taxInfoValue}>
                                REF-MKT-2026-001234
                            </Text>
                        </View>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Payment Status
                            </Text>
                            <Text style={styles.paymentStatus}>
                                Confirmed & Settled
                            </Text>
                        </View>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Payment Date
                            </Text>
                            <Text style={styles.taxInfoValue}>
                                22 Jan 2026
                            </Text>
                        </View>
                        <View style={styles.taxInfoColumn}>
                            <Text style={styles.taxInfoLabel}>
                                Total Amount Paid
                            </Text>
                            <Text style={styles.totalPaid}>
                                $240.50
                            </Text>
                        </View>
                    </View>
                    {/* tax information end*/}

                    {/* note section start */}
                    <View style={styles.noteSection}>
                        <Text style={styles.noteTitle}>
                            Admin Note:{' '}
                            <Text style={styles.noteText}>
                                This is an internal administrative copy of the
                                marketplace order invoice. This document
                                contains the complete financial breakdown
                                including marketplace revenue, seller payouts,
                                and tax information. All amounts are in USD.
                                This invoice is for internal accounting and
                                reconciliation purposes only.
                            </Text>
                        </Text>
                    </View>
                    {/* note section end */}
                </View>
            </Page>
        </Document>
    );
};

export default customerInvoice2;