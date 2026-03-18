// External Dependencies
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

interface PdfDownloadButtonProps< T extends Record< string, unknown > > {
    PdfComponent: React.ComponentType< T >;
    fileName: string;
    data?: T;
}

const PdfDownloadButton = < T extends object = Record< string, unknown > >( {
    PdfComponent,
    fileName,
    data,
}: PdfDownloadButtonProps< T > ) => (
    <PDFDownloadLink
        document={ <PdfComponent { ...( data ?? ( {} as T ) ) } /> }
        fileName={ fileName }
    >
        { ( { loading } ) => ( loading ? 'Generating PDF…' : 'Download PDF' ) }
    </PDFDownloadLink>
);

export default PdfDownloadButton;
