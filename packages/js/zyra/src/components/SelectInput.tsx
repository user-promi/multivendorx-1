/**
 * External dependencies
 */
import React from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue, ActionMeta } from 'react-select';

// Types
export interface SelectOptions {
    value: string;
    label?: string;
    index?: number;
}

interface SelectInputProps {
    wrapperClass?: string;
    selectDeselect?: boolean;
    selectDeselectClass?: string;
    selectDeselectValue?: string;
    name?: string;
    onMultiSelectDeselectChange?: (
        e: React.MouseEvent< HTMLButtonElement >
    ) => void;
    options: SelectOptions[];
    value?: string | string[];
    inputClass?: string;
    type?: 'single-select' | 'multi-select';
    onChange?: (
        newValue: SingleValue< SelectOptions > | MultiValue< SelectOptions >,
        actionMeta: ActionMeta< SelectOptions >
    ) => void;
    onClick?: ( e: React.MouseEvent< HTMLInputElement > ) => void;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
}

const SelectInput: React.FC< SelectInputProps > = ( {
    wrapperClass,
    selectDeselect,
    selectDeselectClass,
    selectDeselectValue,
    name,
    onMultiSelectDeselectChange,
    options,
    value,
    inputClass,
    type = 'single-select',
    onChange,
    proSetting,
    description,
    descClass,
} ) => {
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderColor: state.isFocused ? 'blue' : 'gray',
            boxShadow: state.isFocused ? '0 0 0 1px blue' : 'none',
            '&:hover': { borderColor: 'blue' },
            minHeight: '40px',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#007bff'
                : state.isFocused
                ? '#e6f0ff'
                : 'white',
            color: state.isSelected ? 'white' : 'black',
            cursor: 'pointer',
            padding: 10,
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: 4,
            marginTop: 0,
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: '#007bff33',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: '#007bff',
        }),
    };
    
    // Convert options to react-select format
    const optionsData: SelectOptions[] = options.map( ( option, index ) => ( {
        value: option.value,
        label: option.label,
        index,
    } ) );

    // Find default selected value
    const defaultValue = Array.isArray( value )
        ? optionsData.filter( ( opt ) => new Set( value ).has( opt.value ) ) // If it's an array (multi-select), return null or handle differently
        : optionsData.find( ( opt ) => opt.value === value ) || null;

    return (
        <div className={ wrapperClass }>
            { selectDeselect && (
                <button
                    className={ selectDeselectClass }
                    onClick={ ( e ) => {
                        e.preventDefault();
                        onMultiSelectDeselectChange?.( e );
                    } }
                >
                    { selectDeselectValue }
                </button>
            ) }
            <Select
                name={ name }
                className={ inputClass }
                value={ defaultValue }
                options={ optionsData }
                onChange={ ( newValue, actionMeta ) => {
                    onChange?.( newValue, actionMeta );
                } }
                styles={customStyles}
                closeMenuOnSelect={false}
                isMulti={ type === 'multi-select' } 
            />
            { proSetting && <span className="admin-pro-tag">Pro</span> }
            { description && (
                <p
                    className={ descClass }
                    dangerouslySetInnerHTML={ { __html: description } }
                ></p>
            ) }
        </div>
    );
};

export default SelectInput;
