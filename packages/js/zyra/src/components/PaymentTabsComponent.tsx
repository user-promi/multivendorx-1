import React, { useRef, useState } from 'react';
import '../styles/web/PaymentTabsComponent.scss';
import TextArea from './TextArea';
import ToggleSetting from './ToggleSetting';
import MultiCheckBox from './MultiCheckbox';
import NestedComponent from './NestedComponent';

interface ClickableItem {
    name: string;
    url?: string;
}

interface ButtonItem {
    label: string;
    url?: string;
}

interface AppLocalizer {
    khali_dabba?: boolean;
    site_url?: string;
}

interface FieldOption {
    value: string | number;
    label: string;
    desc?: string;
    check?: boolean;
    action?: string;
    btnClass?: string;
    url?: string;
}

interface PaymentFormField {
    key: string;
    type:
        | 'text'
        | 'password'
        | 'number'
        | 'checkbox'
        | 'verification-methods'
        | 'textarea'
        | 'payment-tabs'
        | 'multi-checkbox'
        | 'check-list'
        | 'description'
        | 'setup'
        | 'setting-toggle'
        | 'buttons'
        | 'nested'
        | 'clickable-list'
        | 'copy-text';

    label: string;
    placeholder?: string;
    nestedFields?: PaymentFormField[];
    des?: string;
    addButtonLabel?: string;
    deleteButtonLabel?: string;
    class?: string;
    desc?: string;
    rowNumber?: number;
    colNumber?: number;
    options?: FieldOption[];
    modal?: PaymentMethod[];
    look?: string;
    selectDeselect?: boolean;
    rightContent?: string;
    addNewBtn?: boolean;
    proSetting?: boolean;
    moduleEnabled?: string;
    dependentSetting?: string;
    dependentPlugin?: string;
    title?: string;
    link?: string;
    check?: boolean;
    hideCheckbox?: boolean;
    btnClass?: string;
    items?: ClickableItem[];
    button?: ButtonItem;
}

interface PaymentMethod {
    icon: string;
    id: string;
    label: string;
    connected: boolean;
    disableBtn?: boolean;
    countBtn?: boolean;
    desc: string;
    formFields?: PaymentFormField[];
    toggleType?: 'icon' | 'checkbox';
    wrapperClass?: string;
    openForm?: boolean;
    single?: boolean;
    rowClass?: string;
    nestedFields?: PaymentFormField[];
    proSetting?: boolean;
    moduleEnabled?: string;
}

interface PaymentTabsComponentProps {
    name: string;
    proSetting?: boolean;
    proSettingChanged?: () => void;
    apilink?: string;
    appLocalizer?: AppLocalizer;
    methods: PaymentMethod[];
    value: Record< string, Record< string, unknown > >;
    onChange: ( data: Record< string, Record< string, unknown > > ) => void;
    buttonEnable?: boolean;
    isWizardMode?: boolean;
    setWizardIndex?: ( index: number ) => void;
    moduleEnabled?: boolean;
    proChanged?: () => void;
    moduleChange: ( module: string ) => void;
    modules: string[];
}

const PaymentTabsComponent: React.FC< PaymentTabsComponentProps > = ( {
    methods,
    value,
    onChange,
    appLocalizer,
    isWizardMode = false,
    proSetting,
    moduleEnabled,
    proChanged,
    moduleChange,
    modules,
} ) => {
    const [ activeTabs, setActiveTabs ] = useState< string[] >( [] );
    const menuRef = useRef< HTMLDivElement >( null );
    const [ wizardIndex, setWizardIndex ] = useState( 0 );

    const canEdit = () => {
        // You cannot edit if Pro is enabled (locked) OR if module is disabled
        return ! proSetting && moduleEnabled;
    };

    const handleCopy = ( text: string ) => {
        navigator.clipboard.writeText( text );
    };

    const handleInputChange = (
        methodKey: string,
        fieldKey: string,
        fieldValue: string | string[] | number | boolean | undefined
    ) => {
        if ( ! canEdit() ) {
            return;
        }

        const updated = {
            ...value,
            [ methodKey ]: {
                ...( value[ methodKey ] as Record< string, unknown > ),
                [ fieldKey ]: fieldValue,
            },
        };

        onChange( updated );
    };

    const toggleEnable = ( methodId: string, enable: boolean ) => {
        if ( ! canEdit() ) {
            return;
        }
        handleInputChange( methodId, 'enable', enable );
        if ( enable ) {
            setActiveTabs( ( prev ) =>
                prev.filter( ( id ) => id !== methodId )
            );
        }
    };

    const toggleActiveTab = ( methodId: string ) => {
        if ( ! canEdit() ) {
            return;
        }
        setActiveTabs(
            ( prev ) =>
                prev.includes( methodId )
                    ? prev.filter( ( id ) => id !== methodId ) // close
                    : [ ...prev, methodId ] // open
        );
    };

    const isProSetting = ( val: boolean ) => val;

    const handleMultiSelectDeselect = (
        methodId: string,
        field: PaymentFormField
    ) => {
        const allValues = Array.isArray( field.options )
            ? field.options.map( ( opt ) => String( opt.value ) )
            : [];

        const current = value?.[ methodId ]?.[ field.key ] || [];

        const currentArray = Array.isArray( current )
            ? current
            : typeof current === 'string' && current.trim() !== ''
            ? [ current ]
            : [];

        const isAllSelected = currentArray.length === allValues.length;

        const result = isAllSelected ? [] : allValues;

        handleInputChange( methodId, field.key, result );
    };

    const renderWizardButtons = () => {
        const step = methods[ wizardIndex ];
        const buttonField = step?.formFields?.find(
            ( f ) => f.type === 'buttons'
        );
        if ( ! buttonField ) {
            return null;
        }

        return renderField( step.id, buttonField );
    };
    const renderField = ( methodId: string, field: PaymentFormField ) => {
        const fieldValue = value[ methodId ]?.[ field.key ];

        switch ( field.type ) {
            case 'setting-toggle':
                return (
                    <ToggleSetting
                        key={ field.key }
                        description={ field.desc }
                        options={
                            Array.isArray( field.options )
                                ? field.options.map( ( opt ) => ( {
                                      ...opt,
                                      value: String( opt.value ),
                                  } ) )
                                : []
                        }
                        value={ fieldValue || '' }
                        onChange={ ( val ) =>
                            handleInputChange( methodId, field.key, val )
                        }
                    />
                );

            case 'checkbox':
                return (
                    <>
                        <input
                            type="checkbox"
                            checked={ !! fieldValue }
                            onChange={ ( e ) =>
                                handleInputChange(
                                    methodId,
                                    field.key,
                                    e.target.checked
                                )
                            }
                        />
                        <div className="settings-metabox-description">
                            { field.desc }
                        </div>
                    </>
                );
            case 'clickable-list':
                return (
                    <div className="clickable-list-wrapper">
                        { /* Render items */ }
                        <ul className="clickable-items">
                            { Array.isArray( field.items ) &&
                                field.items.map( ( item, idx ) => (
                                    <li
                                        key={ idx }
                                        className={ `clickable-item ${
                                            item.url ? 'has-link' : ''
                                        }` }
                                        onClick={ () => {
                                            if ( item.url ) {
                                                let url = item.url;
                                                window.open( url, '_self' );
                                            }
                                        } }
                                    >
                                        { item.name }
                                    </li>
                                ) ) }
                        </ul>

                        { /* Render bottom button */ }
                        { field.button?.label && (
                            <button
                                className="admin-btn btn-purple"
                                onClick={ ( e ) => {
                                    if ( field.button.url ) {
                                        e.preventDefault();
                                        window.open(
                                            field.button.url,
                                            '_blank'
                                        );
                                    }
                                } }
                            >
                                { field.button.label }
                            </button>
                        ) }

                        { field.desc && (
                            <div className="settings-metabox-description">
                                { field.desc }
                            </div>
                        ) }
                    </div>
                );

            case 'textarea':
                return (
                    <TextArea
                        wrapperClass="setting-from-textarea"
                        inputClass={ `${ field.class || '' } textarea-input` }
                        descClass="settings-metabox-description"
                        description={ field.desc || '' }
                        key={ field.key }
                        id={ field.key }
                        name={ field.key }
                        placeholder={ field.placeholder }
                        rowNumber={ field.rowNumber }
                        colNumber={ field.colNumber }
                        value={ fieldValue || '' }
                        proSetting={ false }
                    />
                );
            case 'multi-checkbox': {
                let normalizedValue: string[] = [];

                if ( Array.isArray( fieldValue ) ) {
                    normalizedValue = fieldValue.filter(
                        ( v ) => v && v.trim() !== ''
                    );
                } else if (
                    typeof fieldValue === 'string' &&
                    fieldValue.trim() !== ''
                ) {
                    normalizedValue = [ fieldValue ];
                }

                return (
                    <MultiCheckBox
                        khali_dabba={ appLocalizer?.khali_dabba ?? false }
                        wrapperClass={
                            field.look === 'toggle'
                                ? 'toggle-btn'
                                : field.selectDeselect === true
                                ? 'checkbox-list-side-by-side'
                                : 'simple-checkbox'
                        }
                        descClass="settings-metabox-description"
                        description={ field.desc }
                        selectDeselectClass="admin-btn btn-purple select-deselect-trigger"
                        inputWrapperClass="toggle-checkbox-header"
                        inputInnerWrapperClass={
                            field.look === 'toggle'
                                ? 'toggle-checkbox'
                                : 'default-checkbox'
                        }
                        inputClass={ field.class }
                        idPrefix="toggle-switch"
                        selectDeselect={ field.selectDeselect }
                        selectDeselectValue="Select / Deselect All"
                        rightContentClass="settings-metabox-description"
                        options={
                            Array.isArray( field.options )
                                ? field.options.map( ( opt ) => ( {
                                      ...opt,
                                      value: String( opt.value ),
                                  } ) )
                                : []
                        }
                        /* THIS IS THE FIX */
                        value={ normalizedValue }
                        onChange={ ( e: any ) => {
                            // Case 1: MultiCheckBox gives an array of selected values (preferred)
                            if ( Array.isArray( e ) ) {
                                handleInputChange( methodId, field.key, e );
                                return;
                            }

                            // Case 2: It's a native/react change event — extract value/checked and build array
                            if (
                                e &&
                                e.target &&
                                typeof e.target.value !== 'undefined'
                            ) {
                                const val = String( e.target.value );
                                const checked = !! e.target.checked;

                                // Current stored value for this field
                                let current =
                                    value?.[ methodId ]?.[ field.key ];

                                // Normalize to array
                                if ( ! Array.isArray( current ) ) {
                                    if (
                                        typeof current === 'string' &&
                                        current.trim() !== ''
                                    ) {
                                        current = [ current ];
                                    } else {
                                        current = [];
                                    }
                                } else {
                                    // clone to avoid mutating props/state directly
                                    current = [ ...current ];
                                }

                                if ( checked ) {
                                    if ( ! current.includes( val ) ) {
                                        current.push( val );
                                    }
                                } else {
                                    current = current.filter(
                                        ( v: string ) => v !== val
                                    );
                                }

                                handleInputChange(
                                    methodId,
                                    field.key,
                                    current
                                );
                                return;
                            }

                            // Fallback: pass simple values only
                            handleInputChange( methodId, field.key, e );
                        } }
                        proSetting={ isProSetting( field.proSetting ?? false ) }
                        onMultiSelectDeselectChange={ () => {
                            handleMultiSelectDeselect( methodId, field );
                        } }
                    />
                );
            }
            case 'description':
                return (
                    <>
                        { field.title ? (
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    { field.title }
                                </div>

                                { field.des && (
                                    <p
                                        className="payment-description"
                                        dangerouslySetInnerHTML={ {
                                            __html: field.des,
                                        } }
                                    />
                                ) }
                            </div>
                        ) : (
                            field.des && (
                                <p
                                    className="payment-description"
                                    dangerouslySetInnerHTML={ {
                                        __html: field.des,
                                    } }
                                />
                            )
                        ) }
                    </>
                );
            case 'setup':
                return (
                    <>
                        <div className="wizard-step">
                            <div
                                className="step-info"
                                onClick={ () =>
                                    handleInputChange(
                                        methodId,
                                        field.key,
                                        ! fieldValue
                                    )
                                }
                            >
                                { ! field.hideCheckbox && (
                                    <div className="default-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={ !! fieldValue }
                                            onChange={ ( e ) =>
                                                handleInputChange(
                                                    methodId,
                                                    field.key,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={ `step-checkbox-${ methodId }-${ field.key }` }
                                        ></label>
                                    </div>
                                ) }
                                <div className="step-text">
                                    <span className="step-title">
                                        { field.title }
                                    </span>
                                    <span className="step-desc">
                                        { field.des }
                                    </span>
                                </div>
                            </div>
                            { field.link && (
                                <a
                                    href={ field.link }
                                    className="admin-btn btn-purple"
                                >
                                    Set Up{ ' ' }
                                    <i className="adminlib-arrow-right"></i>{ ' ' }
                                </a>
                            ) }
                        </div>
                    </>
                );
            case 'check-list':
                return (
                    <>
                        <ul className="check-list">
                            { Array.isArray( field.options ) &&
                                field.options.map(
                                    ( item: FieldOption, index: number ) => (
                                        <li key={ index }>
                                            { item.check ? (
                                                <i className="check adminlib-icon-yes"></i>
                                            ) : (
                                                <i className="close adminlib-cross"></i>
                                            ) }
                                            { item.desc }
                                        </li>
                                    )
                                ) }
                        </ul>
                    </>
                );

            case 'copy-text':
                return (
                    <>
                        <div className="copy-text-wrapper">
                            <code>{ field.title }</code>
                            <i
                                className="adminlib-vendor-form-copy"
                                onClick={ () => handleCopy( field.title ) }
                            ></i>

                            { /* {copied && <span className="copied-msg">Copied!</span>} */ }
                        </div>
                        <div className="settings-metabox-description">
                            { field.desc }
                        </div>
                    </>
                );

            case 'buttons':
                return (
                    <>
                        { Array.isArray( field.options ) &&
                            field.options.map( ( item, index ) => {
                                const wizardSteps = methods.filter(
                                    ( m ) => m.isWizardMode === true
                                );
                                const isLastStep =
                                    wizardIndex === wizardSteps.length - 1;

                                // Skip Button
                                if ( item.action === 'skip' ) {
                                    return (
                                        <button
                                            key={ index }
                                            className={ item.btnClass }
                                            onClick={ () => {
                                                setWizardIndex(
                                                    methods.length
                                                );
                                                let url = `${ appLocalizer.site_url }`;
                                                window.open( url, '_self' );
                                            } }
                                        >
                                            { item.label }
                                        </button>
                                    );
                                }

                                // Next / Finish Button
                                if ( item.action === 'next' ) {
                                    return (
                                        <button
                                            key={ index }
                                            className={ item.btnClass }
                                            onClick={ () => {
                                                if ( ! isLastStep ) {
                                                    const allWizardSteps =
                                                        methods
                                                            .map(
                                                                ( m, i ) => ( {
                                                                    ...m,
                                                                    index: i,
                                                                } )
                                                            )
                                                            .filter(
                                                                ( m ) =>
                                                                    m.isWizardMode ===
                                                                    true
                                                            );

                                                    const nextWizardStep =
                                                        allWizardSteps[
                                                            wizardIndex + 1
                                                        ];

                                                    if ( nextWizardStep ) {
                                                        setWizardIndex(
                                                            nextWizardStep.index
                                                        );
                                                        setActiveTabs( [
                                                            nextWizardStep.id,
                                                        ] );
                                                    }
                                                } else {
                                                    let url = `${ appLocalizer.site_url }/wp-admin/admin.php?page=multivendorx#&tab=modules`;
                                                    window.open( url, '_self' );
                                                }
                                            } }
                                        >
                                            { isLastStep
                                                ? 'Finish'
                                                : item.label }
                                        </button>
                                    );
                                }

                                return (
                                    <div
                                        key={ index }
                                        className={ item.btnClass }
                                    >
                                        { item.label }
                                    </div>
                                );
                            } ) }
                    </>
                );

            case 'nested':
                return (
                    <NestedComponent
                        key={ field.key }
                        id={ field.key }
                        label={ field.label }
                        description={ field.desc }
                        fields={ field.nestedFields ?? [] }
                        value={ fieldValue }
                        wrapperClass={ field.rowClass }
                        addButtonLabel={ field.addButtonLabel }
                        deleteButtonLabel={ field.deleteButtonLabel }
                        single={ field.single }
                        onChange={ ( val: any ) => {
                            handleInputChange( methodId, field.key, val );
                        } }
                    />
                );
            default:
                return (
                    <>
                        <input
                            type={ field.type }
                            placeholder={ field.placeholder }
                            value={ fieldValue || '' }
                            className="basic-input"
                            onChange={ ( e ) =>
                                handleInputChange(
                                    methodId,
                                    field.key,
                                    e.target.value
                                )
                            }
                        />
                        <div className="settings-metabox-description">
                            { field.desc }
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            <div className="payment-tabs-component">
                { methods.map( ( method, index ) => {
                    const isEnabled = value?.[ method.id ]?.enable ?? false;
                    const isActive = activeTabs.includes( method.id );
                    console.log( 'method', method );
                    if ( isWizardMode && index > wizardIndex ) {
                        return null;
                    }

                    return (
                        <div
                            key={ method.id }
                            className={ `payment-method-card ${
                                method.disableBtn && ! isEnabled
                                    ? 'disable'
                                    : ''
                            } ${ method.openForm ? 'open' : '' } ` }
                        >
                            { /* Header */ }
                            <div className="payment-method">
                                <div className="toggle-icon">
                                    { method.formFields &&
                                        method.formFields.length > 0 &&
                                        ! method.openForm && (
                                            <i
                                                className={ `adminlib-${
                                                    isEnabled && isActive
                                                        ? 'keyboard-arrow-down'
                                                        : 'pagination-right-arrow'
                                                }` }
                                                onClick={ () => {
                                                    if (
                                                        method.proSetting &&
                                                        ! appLocalizer?.khali_dabba
                                                    ) {
                                                        proChanged?.();
                                                        return;
                                                    } else if (
                                                        method.moduleEnabled &&
                                                        ! modules.includes(
                                                            method.moduleEnabled
                                                        )
                                                    ) {
                                                        moduleChange?.(
                                                            method.moduleEnabled
                                                        );
                                                        return;
                                                    } else {
                                                        toggleActiveTab(
                                                            method.id
                                                        );
                                                    }
                                                } }
                                            />
                                        ) }
                                </div>

                                <div
                                    className="details"
                                    onClick={ () => {
                                        if (
                                            method.proSetting &&
                                            ! appLocalizer?.khali_dabba
                                        ) {
                                            proChanged?.();
                                            return;
                                        } else if (
                                            method.moduleEnabled &&
                                            ! modules.includes(
                                                method.moduleEnabled
                                            )
                                        ) {
                                            moduleChange?.(
                                                method.moduleEnabled
                                            );
                                            return;
                                        } else {
                                            toggleActiveTab( method.id );
                                        }
                                    } }
                                >
                                    <div className="details-wrapper">
                                        <div className="payment-method-icon">
                                            <i className={ method.icon }></i>
                                        </div>
                                        <div className="payment-method-info">
                                            <div className="title-wrapper">
                                                <span className="title">
                                                    { method.label }
                                                </span>

                                                { method.disableBtn ? (
                                                    <>
                                                        <div
                                                            className={ `admin-badge ${
                                                                isEnabled
                                                                    ? 'green'
                                                                    : 'red'
                                                            }` }
                                                        >
                                                            { isEnabled
                                                                ? 'Active'
                                                                : 'Inactive' }
                                                        </div>
                                                    </>
                                                ) : null }

                                                { /* {method.countBtn && (
                        <div className="admin-badge red">1/3</div>
                      )} */ }
                                            </div>
                                            <div className="method-desc">
                                                <p
                                                    dangerouslySetInnerHTML={ {
                                                        __html: method.desc,
                                                    } }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="right-section" ref={ menuRef }>
                                    { method.disableBtn ? (
                                        <ul>
                                            { isEnabled ? (
                                                <>
                                                    { method.formFields &&
                                                        method.formFields
                                                            .length > 0 && (
                                                            <li
                                                                onClick={ () => {
                                                                    if (
                                                                        method.proSetting &&
                                                                        ! appLocalizer?.khali_dabba
                                                                    ) {
                                                                        proChanged?.();
                                                                        return;
                                                                    } else if (
                                                                        method.moduleEnabled &&
                                                                        ! modules.includes(
                                                                            method.moduleEnabled
                                                                        )
                                                                    ) {
                                                                        moduleChange?.(
                                                                            method.moduleEnabled
                                                                        );
                                                                        return;
                                                                    } else {
                                                                        toggleActiveTab(
                                                                            method.id
                                                                        );
                                                                    }
                                                                } }
                                                            >
                                                                <i className="settings-icon adminlib-setting"></i>
                                                                <span>
                                                                    Settings
                                                                </span>
                                                            </li>
                                                        ) }
                                                    <li
                                                        onClick={ () => {
                                                            if (
                                                                method.proSetting &&
                                                                ! appLocalizer?.khali_dabba
                                                            ) {
                                                                proChanged?.();
                                                                return;
                                                            } else if (
                                                                method.moduleEnabled &&
                                                                ! modules.includes(
                                                                    method.moduleEnabled
                                                                )
                                                            ) {
                                                                moduleChange?.(
                                                                    method.moduleEnabled
                                                                );
                                                                return;
                                                            } else {
                                                                toggleEnable(
                                                                    method.id,
                                                                    false
                                                                );
                                                            }
                                                        } }
                                                    >
                                                        <i className="disable-icon adminlib-eye-blocked"></i>
                                                        <span>Disable</span>
                                                    </li>
                                                </>
                                            ) : (
                                                <li
                                                    onClick={ () => {
                                                        if (
                                                            method.proSetting &&
                                                            ! appLocalizer?.khali_dabba
                                                        ) {
                                                            proChanged?.();
                                                            return;
                                                        } else if (
                                                            method.moduleEnabled &&
                                                            ! modules.includes(
                                                                method.moduleEnabled
                                                            )
                                                        ) {
                                                            moduleChange?.(
                                                                method.moduleEnabled
                                                            );
                                                            return;
                                                        } else {
                                                            toggleEnable(
                                                                method.id,
                                                                true
                                                            );
                                                        }
                                                    } }
                                                >
                                                    <i className="eye-icon adminlib-eye"></i>
                                                    <span>Enable</span>
                                                </li>
                                            ) }
                                        </ul>
                                    ) : method.countBtn ? (
                                        <div className="admin-badge red">
                                            1/3
                                        </div>
                                    ) : null }
                                </div>
                            </div>

                            { method.formFields &&
                                method.formFields.length > 0 && (
                                    <div
                                        className={ `
                                        ${ method.wrapperClass || '' } 
                                        payment-method-form
                                        ${
                                            isEnabled &&
                                            ( isActive || method.openForm )
                                                ? 'open'
                                                : ''
                                        }
                                        ${ method.openForm ? 'open' : '' }
                                      ` }
                                    >
                                        { method.formFields.map( ( field ) => {
                                            if (
                                                isWizardMode &&
                                                field.type === 'buttons'
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={ field.key }
                                                    className="form-group"
                                                >
                                                    { field.label && (
                                                        <label>
                                                            { field.label }
                                                        </label>
                                                    ) }
                                                    <div className="input-content">
                                                        { renderField(
                                                            method.id,
                                                            field
                                                        ) }
                                                    </div>
                                                </div>
                                            );
                                        } ) }
                                    </div>
                                ) }
                        </div>
                    );
                } ) }
            </div>
            { isWizardMode && (
                <div className="button-wrapper wizard-footer-buttons">
                    { renderWizardButtons() }
                </div>
            ) }
        </>
    );
};

export default PaymentTabsComponent;
