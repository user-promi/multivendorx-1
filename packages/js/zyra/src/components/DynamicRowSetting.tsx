/**
 * External dependencies
 */
import React from 'react';
import Select from 'react-select';
import '../styles/web/DynamicRowSetting.scss';

/**
 * Internal dependencies
 */
import '../styles/web/ToggleSetting.scss';

// Types
type FieldType = 'text' | 'number' | 'file' | 'select';

type RowValue = Record< string, string | number | File | RowValue[] | null >;

interface FieldConfig {
    key: string;
    label?: string;
    type: FieldType;
    placeholder?: string;
    options?: { label: string; value: string; children?: RowValue[] }[];
    width?: string;
}

interface RowConfig {
    fields: FieldConfig[];
}

interface DynamicRowSettingProps {
    description?: string;
    wrapperClass?: string;
    descClass?: string;
    keyName: string;
    template: RowConfig;
    value: RowValue[];
    onChange: ( rows: RowValue[] ) => void;
    addLabel?: string;
    childrenRenderer?: ( row: RowValue, rowIndex: number ) => React.ReactNode;
}

const DynamicRowSetting: React.FC< DynamicRowSettingProps > = ( {
    description = '',
    wrapperClass = '',
    descClass = '',
    template,
    value,
    onChange,
    addLabel = 'Add New',
    childrenRenderer = undefined,
} ) => {
    const handleAdd = () => {
        const emptyRow: RowValue = {};
        template.fields.forEach( ( field ) => {
            emptyRow[ field.key ] = field.type === 'file' ? null : '';
        } );
        onChange( [ ...value, emptyRow ] );
    };

    const handleChange = (
        rowIndex: number,
        fieldKey: string,
        newVal: string | number | File | RowValue[] | null
    ) => {
        const updatedRows = [ ...value ];
        updatedRows[ rowIndex ] = {
            ...updatedRows[ rowIndex ],
            [ fieldKey ]: newVal,
        };
        onChange( updatedRows );
    };

    const handleDelete = ( rowIndex: number ) => {
        onChange( value.filter( ( _, i ) => i !== rowIndex ) );
    };

    const renderField = (
        row: RowValue,
        field: FieldConfig,
        rowIndex: number
    ) => {
        const val = row[ field.key ];

        switch ( field.type ) {
            case 'text':
            case 'number':
                return (
                    <input
                        type={ field.type }
                        placeholder={ field.placeholder }
                        className="basic-input"
                        value={ val }
                        onChange={ ( e ) =>
                            handleChange( rowIndex, field.key, e.target.value )
                        }
                    />
                );

            case 'file':
                return (
                    <input
                        type="file"
                        className="basic-input"
                        onChange={ (
                            e: React.ChangeEvent< HTMLInputElement >
                        ) => {
                            const file = e.target.files?.[ 0 ] || null;
                            handleChange( rowIndex, field.key, file );
                        } }
                    />
                );

            case 'select':
                return (
                    <div className="select-wrapper">
                        <Select
                            placeholder={ field.placeholder }
                            className={ `react-select` }
                            value={
                                field.options?.find(
                                    ( opt ) => opt.value === val
                                ) || null
                            }
                            options={ field.options || [] }
                            onChange={ ( selected ) => {
                                handleChange(
                                    rowIndex,
                                    field.key,
                                    selected?.value || ''
                                );

                                if ( selected?.children ) {
                                    handleChange(
                                        rowIndex,
                                        field.key + '_children',
                                        selected.children
                                    );
                                }
                            } }
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className={ `repeater-field-wrapper ${ wrapperClass }` }>
                { value.map( ( row, rowIndex ) => (
                    <>
                        <div key={ rowIndex } className="repeater-field">
                            <div className="field">
                                { template.fields.map( ( field ) => (
                                    <>{ renderField( row, field, rowIndex ) }</>
                                ) ) }

                                <span
                                    className="delete-icon adminlib-delete"
                                    onClick={ () => handleDelete( rowIndex ) }
                                ></span>
                            </div>
                            { ( () => {
                                const nestedChildren = childrenRenderer?.(
                                    row,
                                    rowIndex
                                );
                                return nestedChildren ? (
                                    <div className="repeater-field-nested">
                                        { nestedChildren }
                                    </div>
                                ) : null;
                            } )() }
                        </div>
                    </>
                ) ) }

                <button
                    type="button"
                    className="admin-btn btn-purple-bg"
                    onClick={ handleAdd }
                >
                    <i className="adminlib-plus-circle"></i> { addLabel }
                </button>
            </div>

            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </>
    );
};

export default DynamicRowSetting;
