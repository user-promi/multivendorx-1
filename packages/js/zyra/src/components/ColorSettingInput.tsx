import React, { ChangeEvent, useState, useEffect, useMemo } from 'react';
import '../styles/web/ColorSettingInput.scss';
import ToggleSetting from './ToggleSetting';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';

interface CustomColors {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorSupport: string;
}

interface ColorSettingValue {
    selectedPalette: string;
    colors: Partial< CustomColors >;
}

interface PaletteOption {
    key?: string;
    value?: string;
    label?: string;
    colors?: Partial< CustomColors >;
    image?: string;
}

interface ImagePaletteOption {
    key?: string;
    value?: string;
    label?: string;
    img?: string;
}

// 🔹 NEW: Template & Theme interfaces for invoice templates
type ThemeVars = Record<string, string>;

interface Template {
    key: string;
    label: string;
    preview?: string;
    html: string;
}

interface PresetTheme {
    name: string;
    vars: Partial<ThemeVars>;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;
    predefinedOptions: PaletteOption[];
    images: ImagePaletteOption[];
    value?: { selectedPalette: string; colors: Partial< CustomColors >; templateKey?: string; themeVars?: ThemeVars }; // object from DB
    onChange?: ( e: {
        target: { name: string; value: ColorSettingValue | { templateKey: string; themeVars: ThemeVars } };
    } ) => void;
    idPrefix?: string;
    showPreview?: boolean;
    // 🔹 NEW: Template & PDF support
    templates?: Template[];
    presetThemes?: PresetTheme[];
    showPdfButton?: boolean;
    apiLink?: string;
    appLocalizer?: any;
}

// 🔹 Default colors for invoice templates
const DEFAULT_COLORS: ThemeVars = {
    '--accent': '#6366f1',
    '--accent-secondary': '#22d3ee',
    '--bg-page': '#ffffff',
    '--bg-card': '#f9fafb',
    '--text-primary': '#111827',
    '--text-muted': '#6b7280',
    '--border-color': '#e5e7eb',
};

const ColorSettingInput: React.FC< ColorSettingProps > = ( props ) => {
    // Initialize selectedPalette from DB value or default to first option
    const initialPalette =
        props.value?.selectedPalette ||
        ( props.predefinedOptions[ 0 ]?.value ?? '' );
    const initialColors = props.value?.colors || {};

    // 🔹 Determine initial mode based on whether templates are provided
    const hasTemplates = props.templates && props.templates.length > 0;
    const initialMode = hasTemplates && initialPalette === 'templates'
        ? 'templates'
        : initialPalette === 'custom'
        ? 'custom'
        : 'predefined';

    const [ mode, setMode ] = useState< 'predefined' | 'custom' | 'templates' >(
        initialMode as 'predefined' | 'custom' | 'templates'
    );
    const [ selectedPalette, setSelectedPalette ] = useState( initialPalette );
    const [ selectedColors, setSelectedColors ] =
        useState< Partial< CustomColors > >( initialColors );
    const [ customColors, setCustomColors ] = useState< CustomColors >( {
        colorPrimary: '#FF5959',
        colorSecondary: '#FADD3A',
        colorAccent: '#49BEB6',
        colorSupport: '#075F63',
        ...initialColors,
    } );

    const [ selectedImage, setSelectedImage ] = useState< string | null >(
        props.images?.[ 0 ]?.img || null
    );

    // 🔹 NEW: Template-related state
    const [ templateKey, setTemplateKey ] = useState(
        props.value?.templateKey || props.templates?.[ 0 ]?.key || ''
    );
    const [ themeVars, setThemeVars ] = useState< ThemeVars >( {
        ...DEFAULT_COLORS,
        ...props.value?.themeVars,
    } );
    const [ isDownloadingPdf, setIsDownloadingPdf ] = useState( false );

    // 🔹 Get active template
    const activeTemplate = useMemo(
        () => props.templates?.find( ( t ) => t.key === templateKey ),
        [ templateKey, props.templates ]
    );

    useEffect( () => {
        if ( selectedPalette !== 'custom' ) {
            const selectedOption = props.predefinedOptions.find(
                ( opt ) => opt.value === selectedPalette
            );
            setSelectedColors( selectedOption?.colors || {} );
        }
    }, [ selectedPalette, props.predefinedOptions ] );

    useEffect( () => {
        const selectedPaletteValue = props.value?.selectedPalette;
        if ( selectedPaletteValue && props.images ) {
            const matchedImage = props.images.find(
                ( img ) => img.value === selectedPaletteValue
            );
            if ( matchedImage?.img ) {
                setSelectedImage( matchedImage.img );
            }
        }
    }, [ props.value, props.images ] );

    const handlePaletteChange = ( e: ChangeEvent< HTMLInputElement > ) => {
        const value = e.target.value;
        setSelectedPalette( value );

        // Set mode based on selection
        if ( value === 'custom' ) {
            setMode( 'custom' );
        } else {
            setMode( 'predefined' );
        }

        const option = props.predefinedOptions.find(
            ( opt ) => opt.value === value
        );
        const colors = value === 'custom' ? customColors : option?.colors || {};

        setSelectedColors( colors );

        // Use the actual field name from props instead of hardcoded string
        props.onChange?.( {
            target: {
                name: 'store_color_settings',
                value: {
                    selectedPalette: value,
                    colors,
                },
            },
        } );
    };

    const handleCustomChange = ( field: keyof CustomColors, value: string ) => {
        const updated = { ...customColors, [ field ]: value };
        setCustomColors( updated );
        setSelectedColors( updated );
        setSelectedPalette( 'custom' );
        setMode( 'custom' ); // Ensure mode is set to custom

        props.onChange?.( {
            target: {
                name: 'store_color_settings',
                value: {
                    selectedPalette: 'custom',
                    colors: updated,
                },
            },
        } );
    };

    // 🔹 NEW: Template handlers
    const emitTemplateChange = ( nextVars = themeVars, nextTemplate = templateKey ) => {
        props.onChange?.( {
            target: {
                name: 'store_color_settings',
                value: {
                    templateKey: nextTemplate,
                    themeVars: nextVars,
                } as any,
            },
        } );
    };

    const updateThemeColor = ( key: string, val: string ) => {
        const updated = { ...themeVars, [ key ]: val };
        setThemeVars( updated );
        emitTemplateChange( updated );
    };

    const applyPresetTheme = ( vars: Partial< ThemeVars > ) => {
        const updated = { ...DEFAULT_COLORS, ...vars } as ThemeVars;
        setThemeVars( updated );
        emitTemplateChange( updated );
    };

    const resetThemeColors = () => {
        setThemeVars( DEFAULT_COLORS );
        emitTemplateChange( DEFAULT_COLORS );
    };

    const changeTemplate = ( key: string ) => {
        setTemplateKey( key );
        emitTemplateChange( themeVars, key );
    };

    // 🔹 NEW: PDF Download handler
    const handleDownloadPdf = async () => {
        if ( ! props.apiLink || ! props.appLocalizer || ! activeTemplate ) {
            console.error( 'Missing required props for PDF download' );
            return;
        }

        setIsDownloadingPdf( true );

        try {
            // Apply theme variables to the HTML
            let styledHtml = activeTemplate.html;

            // Inject CSS variables into the HTML
            const styleTag = `<style>:root { ${Object.entries(themeVars).map(([key, val]) => `${key}: ${val};`).join(' ')} }</style>`;

            // Insert style tag before closing head tag or at the beginning
            // if (styledHtml.includes('</head>')) {
            //     styledHtml = styledHtml.replace('</head>', `${styleTag}</head>`);
            // } else {
            //     styledHtml = styleTag + styledHtml;
            // }

            const response = await axios( {
                url: getApiLink( props.appLocalizer, props.apiLink ),
                method: 'POST',
                headers: {
                    'X-WP-Nonce': props.appLocalizer.nonce,
                    'Content-Type': 'application/json',
                },
                data: {
                    html: styledHtml,
                    paper: 'A4',
                    orientation: 'portrait',
                },
                responseType: 'blob',
            } );

            // Create download link
            const blob = new Blob( [ response.data ], {
                type: 'application/pdf',
            } );
            const url = window.URL.createObjectURL( blob );
            const link = document.createElement( 'a' );
            link.href = url;
            link.setAttribute( 'download', `invoice-${ templateKey }.pdf` );
            document.body.appendChild( link );
            link.click();
            document.body.removeChild( link );
            window.URL.revokeObjectURL( url );
        } catch ( error ) {
            console.error( 'Error downloading PDF:', error );
            alert( 'Failed to download PDF. Please try again.' );
        } finally {
            setIsDownloadingPdf( false );
        }
    };

    return (
        <>
            <div className={ props.wrapperClass }>
                { /* Toggle Mode */ }
                { ! selectedImage && (
                    <>
                        <ToggleSetting
                            wrapperClass="setting-form-input"
                            descClass="settings-metabox-description"
                            options={ [
                                ...( hasTemplates
                                    ? [
                                          {
                                              key: 'templates',
                                              value: 'templates',
                                              label: 'Templates',
                                          },
                                      ]
                                    : [] ),
                                {
                                    key: 'predefined',
                                    value: 'predefined',
                                    label: 'Pre-defined Palette',
                                },
                                {
                                    key: 'custom',
                                    value: 'custom',
                                    label: 'Custom Palette',
                                },
                            ] }
                            value={ mode }
                            onChange={ ( val: string | string[] ) => {
                                const selectedVal = Array.isArray( val ) ? val[ 0 ] : val;

                                if ( selectedVal === 'predefined' ) {
                                    setMode( 'predefined' );

                                    const value =
                                        props.predefinedOptions[ 0 ]?.value ??
                                        '';

                                    setSelectedPalette( value );

                                    const option = props.predefinedOptions.find(
                                        ( opt ) => opt.value === value
                                    );

                                    const colors = option?.colors || {};

                                    setSelectedColors( colors );

                                    props.onChange?.( {
                                        target: {
                                            name: 'store_color_settings',
                                            value: {
                                                selectedPalette: value,
                                                colors,
                                            },
                                        },
                                    } );
                                }

                                if ( selectedVal === 'custom' ) {
                                    setMode( 'custom' );
                                    setSelectedPalette( 'custom' );
                                    setSelectedColors( customColors );

                                    props.onChange?.( {
                                        target: {
                                            name: 'store_color_settings',
                                            value: {
                                                selectedPalette: 'custom',
                                                colors: customColors,
                                            },
                                        },
                                    } );
                                }
                                if ( selectedVal === 'templates' ) {
                                    setMode( 'templates' );
                                    setSelectedPalette( 'templates' );
                                    setSelectedColors( {} );

                                    // Emit template change instead
                                    emitTemplateChange( themeVars, templateKey );
                                }
                            } }
                        />
                    </>
                ) }
            </div>

            <div className="color-setting">
                <div className="color-palette-wrapper">
                    <div className="predefined">
                        { /* Predefined Palettes */ }
                        { mode === 'predefined' &&
                            props.predefinedOptions.map( ( option ) => {
                                const checked =
                                    selectedPalette === option.value;
                                return (
                                    <div key={ option.key } className="palette">
                                        <input
                                            className={ props.inputClass }
                                            id={ `${ props.idPrefix }-${ option.key }` }
                                            type="radio"
                                            name="vendor_color_scheme_picker"
                                            checked={ checked }
                                            value={ option.value }
                                            onChange={ handlePaletteChange }
                                        />
                                        <label
                                            htmlFor={ `${ props.idPrefix }-${ option.key }` }
                                        >
                                            { option.colors && (
                                                <div className="color">
                                                    { option.colors &&
                                                        Object.values(
                                                            option.colors
                                                        ).map( ( c, i ) => (
                                                            <div
                                                                key={ i }
                                                                style={ {
                                                                    backgroundColor:
                                                                        c,
                                                                } }
                                                            ></div>
                                                        ) ) }
                                                </div>
                                            ) }
                                            { option.image && (
                                                <div className="color">
                                                    <img
                                                        src={ option.image }
                                                        alt=""
                                                    />
                                                </div>
                                            ) }

                                            <span>{ option.label }</span>
                                        </label>
                                    </div>
                                );
                            } ) }
                    </div>
                    <div className="custom">
                        { /* Custom Palette */ }
                        { mode === 'custom' && (
                            <div className="palette">
                                { Object.entries( customColors ).map(
                                    ( [ key, val ] ) => (
                                        <div
                                            className="color-wrapper"
                                            key={ key }
                                        >
                                            <input
                                                type="color"
                                                value={ val }
                                                onChange={ ( e ) =>
                                                    handleCustomChange(
                                                        key as keyof CustomColors,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <label>
                                                <div>
                                                    { key
                                                        .replace(
                                                            /([A-Z])/g,
                                                            ' $1'
                                                        )
                                                        .replace( /^./, ( s ) =>
                                                            s.toUpperCase()
                                                        ) }
                                                </div>
                                                <span>{ val }</span>
                                            </label>
                                        </div>
                                    )
                                ) }
                            </div>
                        ) }
                    </div>
                    <div className="templates">
                        { /* 🔹 NEW: Full Template Builder with Tabs */ }
                        { mode === 'templates' && hasTemplates && (
                            <div className="template-builder-container">
                                { /* Left Side: Template List + Color Controls */ }
                                <div className="template-controls">
                                    { /* Template Selection */ }
                                    <div className="template-list-section">
                                        <h4 className="section-title">Choose Template</h4>
                                        <div className="template-list">
                                            { props.templates?.map( ( tpl ) => (
                                                <div
                                                    key={ tpl.key }
                                                    className={ `template-item ${
                                                        tpl.key === templateKey ? 'active' : ''
                                                    }` }
                                                    onClick={ () => changeTemplate( tpl.key ) }
                                                >
                                                    { tpl.preview && (
                                                        <img src={ tpl.preview } alt={ tpl.label } />
                                                    ) }
                                                    <p>{ tpl.label }</p>
                                                </div>
                                            ) ) }
                                        </div>
                                    </div>

                                    { /* Color Tabs */ }
                                    <div className="color-tabs-section">
                                        <ToggleSetting
                                            wrapperClass="template-color-tabs"
                                            descClass=""
                                            options={ [
                                                {
                                                    key: 'preset',
                                                    value: 'preset',
                                                    label: 'Preset Colors',
                                                },
                                                {
                                                    key: 'custom',
                                                    value: 'custom',
                                                    label: 'Custom Colors',
                                                },
                                            ] }
                                            value={ selectedPalette === 'custom' ? 'custom' : 'preset' }
                                            onChange={ ( val: string | string[] ) => {
                                                const selectedVal = Array.isArray( val ) ? val[ 0 ] : val;
                                                setSelectedPalette( selectedVal );
                                            } }
                                        />

                                        { /* Preset Themes */ }
                                        { selectedPalette !== 'custom' && props.presetThemes && props.presetThemes.length > 0 && (
                                            <div className="preset-themes">
                                                <h4 className="section-title">Preset Themes</h4>
                                                <div className="theme-grid">
                                                    { props.presetThemes.map( ( theme, index ) => (
                                                        <div
                                                            key={ index }
                                                            className="theme-item"
                                                            onClick={ () => applyPresetTheme( theme.vars ) }
                                                        >
                                                            <div className="theme-colors">
                                                                { Object.values( theme.vars ).slice(0, 4).map( ( c, i ) => (
                                                                    <div key={ i } className="color-dot" style={ { background: c } } />
                                                                ) ) }
                                                            </div>
                                                            <span className="theme-name">{ theme.name }</span>
                                                        </div>
                                                    ) ) }
                                                </div>
                                            </div>
                                        ) }

                                        { /* Custom Theme Colors */ }
                                        { selectedPalette === 'custom' && (
                                            <div className="custom-colors">
                                                <h4 className="section-title">Custom Colors</h4>
                                                <div className="color-pickers">
                                                    { Object.entries( themeVars ).map( ( [ key, val ] ) => (
                                                        <div key={ key } className="color-picker-item">
                                                            <label>
                                                                <span className="color-label">
                                                                    { key
                                                                        .replace( '--', '' )
                                                                        .replace( /-/g, ' ' )
                                                                        .replace(/\b\w/g, l => l.toUpperCase()) }
                                                                </span>
                                                                <div className="color-input-wrapper">
                                                                    <input
                                                                        type="color"
                                                                        value={ val }
                                                                        onChange={ ( e ) =>
                                                                            updateThemeColor( key, e.target.value )
                                                                        }
                                                                    />
                                                                    <span className="color-value">{ val }</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ) ) }
                                                </div>
                                            </div>
                                        ) }

                                        { /* Action Buttons */ }
                                        <div className="template-actions">
                                            <button
                                                onClick={ resetThemeColors }
                                                className="btn-reset"
                                            >
                                                Reset Colors
                                            </button>
                                            { props.showPdfButton && (
                                                <button
                                                    onClick={ handleDownloadPdf }
                                                    disabled={ isDownloadingPdf }
                                                    className="btn-download-pdf"
                                                >
                                                    { isDownloadingPdf
                                                        ? 'Downloading...'
                                                        : 'Download PDF' }
                                                </button>
                                            ) }
                                        </div>
                                    </div>
                                </div>

                                { /* Right Side: Live Preview */ }
                                <div className="template-preview">
                                    <h4 className="section-title">Live Preview</h4>
                                    <div
                                        className="preview-iframe-wrapper"
                                        style={ themeVars as React.CSSProperties }
                                        dangerouslySetInnerHTML={ {
                                            __html: activeTemplate?.html || '',
                                        } }
                                    />
                                </div>
                            </div>
                        ) }
                    </div>
                </div>

                { /* Live Preview */ }
                { props.showPreview && (
                    <div className="preview-wrapper">
                        { /* Sidebar */ }
                        <div className="left-wrapper">
                            <div className="logo-wrapper">
                                <div
                                    className="logo"
                                    style={ {
                                        color: selectedColors.colorPrimary,
                                    } }
                                >
                                    MultivendorX
                                </div>
                                <i className="adminfont-menu"></i>
                            </div>
                            <ul className="dashboard-tabs">
                                <li className="tab-name active">
                                    <a
                                        className="tab"
                                        style={ {
                                            color: '#fff',
                                            background:
                                                selectedColors.colorPrimary,
                                        } }
                                    >
                                        <i className="adminfont-module"></i>
                                        Dashboard
                                    </a>
                                </li>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminfont-single-product"></i>
                                        Products
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminfont-sales"></i>
                                        Sales
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>

                                <ul className="subtabs">
                                    <li>
                                        <a>Order</a>
                                    </li>
                                    <li>
                                        <a>Refund</a>
                                    </li>
                                    <li>
                                        <a>Commissions</a>
                                    </li>
                                </ul>

                                <li className="tab-name ">
                                    <a className="tab">
                                        <i className="adminfont-coupon"></i>
                                        Coupons
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminfont-wallet"></i>
                                        Wallet
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminfont-customer-service"></i>
                                        Store Support
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>

                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminfont-report"></i>
                                        Stats / Report
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>
                                <li className="tab-name ">
                                    <a href="#" className="tab">
                                        <i className="adminfont-resources"></i>
                                        Resources
                                    </a>
                                    <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                                </li>
                            </ul>
                        </div>

                        { /* Content Area */ }
                        <div className="tab-wrapper">
                            <div className="top-navbar">
                                <div className="navbar-leftside"></div>
                                <div className="navbar-rightside">
                                    <ul className="navbar-right">
                                        <li>
                                            <div className="adminfont-icon adminfont-moon"></div>
                                        </li>
                                        <li>
                                            <div className="adminfont-icon adminfont-product-addon"></div>
                                        </li>
                                        <li>
                                            <div className="adminfont-icon adminfont-storefront"></div>
                                        </li>
                                        <li>
                                            <div className="adminfont-icon adminfont-notification"></div>
                                        </li>
                                        <li>
                                            <div className="adminfont-icon adminfont-crop-free"></div>
                                        </li>

                                        <li className="dropdown login-user">
                                            <a
                                                href=""
                                                className="dropdown-toggle"
                                            >
                                                <div
                                                    className="avatar-wrapper"
                                                    style={ {
                                                        backgroundColor:
                                                            selectedColors.colorPrimary,
                                                    } }
                                                >
                                                    <i className="adminfont-person"></i>
                                                </div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="tab-content-wrapper">
                                <div className="title-wrapper">
                                    <div className="left-section">
                                        <div className="title">
                                            Good Morning, Store owner!
                                        </div>
                                        <div className="des"></div>
                                    </div>
                                    <div
                                        className="dashboard-btn"
                                        style={ {
                                            background:
                                                selectedColors.colorPrimary,
                                        } }
                                    >
                                        Add new
                                    </div>
                                </div>

                                <div className="dashboard-card-wrapper">
                                    <div
                                        className="item"
                                        style={ {
                                            background: `color-mix(in srgb, ${ selectedColors.colorPrimary } 15%, transparent)`,
                                        } }
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={ {
                                                background:
                                                    selectedColors.colorPrimary,
                                            } }
                                        >
                                            <i className="adminfont-dollar"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={ {
                                            background: `color-mix(in srgb, ${ selectedColors.colorSecondary } 15%, transparent)`,
                                        } }
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={ {
                                                background:
                                                    selectedColors.colorSecondary,
                                            } }
                                        >
                                            <i className="adminfont-order"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={ {
                                            background: `color-mix(in srgb, ${ selectedColors.colorAccent } 15%, transparent)`,
                                        } }
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={ {
                                                background:
                                                    selectedColors.colorAccent,
                                            } }
                                        >
                                            <i className="adminfont-store-seo"></i>
                                        </div>
                                    </div>
                                    <div
                                        className="item"
                                        style={ {
                                            background: `color-mix(in srgb, ${ selectedColors.colorSupport } 15%, transparent)`,
                                        } }
                                    >
                                        <div className="details">
                                            <div className="price"></div>
                                            <div className="des"></div>
                                        </div>
                                        <div
                                            className="icon-wrapper"
                                            style={ {
                                                background:
                                                    selectedColors.colorSupport,
                                            } }
                                        >
                                            <i className="adminfont-commission"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    <div className="section column-8">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="section column-4">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    <div className="section column-4">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="section column-8">
                                        <div className="section-header">
                                            <div className="title"></div>
                                        </div>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }
            </div>

            { /* Image Palette List */ }
            <div className="color-setting two-column-layout">
                <div className="image-list">
                    { props.images &&
                        props.images.map( ( imgOption ) => (
                            <div
                                key={ imgOption.key }
                                className={ `image-thumbnail ${
                                    selectedPalette === imgOption.value
                                        ? 'active'
                                        : ''
                                }` }
                                onClick={ () => {
                                    const value = imgOption.value || '';
                                    setSelectedPalette( value );
                                    setSelectedImage( imgOption.img || null );
                                    setMode( 'predefined' ); // Set mode to predefined when selecting an image

                                    // You need to get the corresponding predefined option
                                    const option = props.predefinedOptions.find(
                                        ( opt ) => opt.value === value
                                    );
                                    const colors = option?.colors || {};

                                    props.onChange?.( {
                                        target: {
                                            name: 'store_color_settings', // Use the correct field name
                                            value: {
                                                selectedPalette: value,
                                                colors,
                                            },
                                        },
                                    } );
                                } }
                            >
                                <img
                                    src={ imgOption.img }
                                    alt={ imgOption.label }
                                />
                                <p>{ imgOption.label }</p>
                            </div>
                        ) ) }
                </div>

                { /* Right side: preview */ }
                <div className="image-preview">
                    { selectedImage && (
                        <img src={ selectedImage } alt="Selected Template" />
                    ) }
                </div>
            </div>

            { props.description && (
                <p
                    className={ props.descClass }
                    dangerouslySetInnerHTML={ { __html: props.description } }
                ></p>
            ) }
        </>
    );
};

export default ColorSettingInput;
