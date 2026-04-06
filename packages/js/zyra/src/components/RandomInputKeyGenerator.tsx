import React from 'react';
import { FieldComponent } from './fieldUtils';
import { ButtonInputUI } from './ButtonInput';

interface RandomInputKeyGeneratorProps {
    value?: string;
    length?: number;
    onChange: (value: string) => void;
}

const generateRandomKey = (len: number): string =>
    Array.from({ length: len }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
            Math.floor(Math.random() * 62)
        )
    ).join('');

export const RandomInputKeyGeneratorUI: React.FC<
    RandomInputKeyGeneratorProps
> = ({ value = '', length = 8, onChange }) => {
    const handleGenerate = () => {
        const key = generateRandomKey(length);
        onChange(key);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
    };

    const handleDelete = () => {
        onChange('');
    };

    if (!value) {
        return (
            <ButtonInputUI
                buttons={[
                    {
                        icon: 'star-icon',
                        text: 'Generate',
                        onClick: handleGenerate,
                    }
                ]}
            />
        );
    }

    return (
        <>
            <div className='clear-btn' onClick={handleCopy}>
               <i className='adminfont-copy' />
            </div>

            <div className='copy-btn' onClick={handleDelete}>
                <i className='adminfont-delete' />
            </div>
        </>
    );
};

const RandomInputKeyGenerator: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <RandomInputKeyGeneratorUI
            value={value}
            length={field.length}
            onChange={onChange}
        />
    ),
};

export default RandomInputKeyGenerator;
