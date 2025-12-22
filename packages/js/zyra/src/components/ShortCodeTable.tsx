/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ShortCodeTable.scss';

// Types
interface Option {
    label?: string;
    name?: string;
    desc?: string;
    arguments?: string;
}

interface ShortCodeTableProps {
    descClass: string;
    description?: string;
    options: Option[];
    optionLabel?: string[];
    icon?: string; // Icon as string
}

const ShortCodeTable: React.FC<ShortCodeTableProps> = (props) => {
    const { descClass, description, options, optionLabel, icon } = props;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            {options && options.length > 0 ? (
                options.map((option, index) => (
                    <>
                        <div className="shortcode-title-wrapper">
                            <code>{option.label}</code>
                            {icon && option.label && (
                                <i className="adminlib-vendor-form-copy"></i>
                            )}
                            {option.desc}
                        </div>

                        <div className="shortcode-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Attribute</th>
                                        <th>Attribute</th>
                                        <th>Attribute</th>
                                        <th>Attribute</th>
                                    </tr>
                                </thead>
                                 <tbody>
                                    <tr>
                                        <td>store</td>
                                        <td>Displays products from a specific store. Accepts Store ID, store slug, email, or username.</td>
                                        <td>string</td>
                                        <td>All stores</td>
                                    </tr>
                                 </tbody>
                            </table>
                        </div>
                    </>
                ))
            ) : (
                <p></p>
            )}

            <table>
                <thead>
                    <tr>
                        {optionLabel && optionLabel.length > 0 ? (
                            optionLabel.map((label, index) => (
                                <th key={index}>{label}</th>
                            ))
                        ) : (
                            <th>No Labels</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {options && options.length > 0 ? (
                        options.map((option, index) => (
                            <tr key={index}>
                                <td
                                    onClick={() =>
                                        handleCopy(option.label!)
                                    }
                                >
                                    <div className="name">
                                        {option.name}
                                    </div>
                                    <code>{option.label}</code>
                                    {icon && option.label && (
                                        <i className="adminlib-vendor-form-copy"></i>
                                    )}
                                </td>
                                <td>{option.desc}</td>
                                <td>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: option.arguments || '',
                                        }}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>No Options Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}
        </>
    );
};

export default ShortCodeTable;
