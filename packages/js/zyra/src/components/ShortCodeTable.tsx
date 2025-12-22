/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ShortCodeTable.scss';

// Types
interface ArgumentRow {
    attribute: string;
    description: string;
    accepted: string;
    default: string;
}

interface Option {
    label?: string;
    name?: string;
    desc?: string;
    arguments?: ArgumentRow[];
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
            {options.map((option, index) => (
                <div className="shortcode-wrapper" key={option.label || index}>
                    <div className="shortcode-details">
                        <div className="shortcode-title">
                            <code>{option.label}</code>
                            {icon && option.label && (
                                <i
                                    className="adminlib-vendor-form-copy"
                                    onClick={() =>
                                        option.label && handleCopy(option.label)
                                    }
                                ></i>
                            )}
                        </div>

                        <div className="des">{option.desc}</div>
                    </div>


                    <div className="shortcode-table">
                        <table>
                            {option.arguments && option.arguments.length > 0 && (
                                <thead>
                                    <tr>
                                        <th>Attribute</th>
                                        <th>Description</th>
                                        <th>Accepted values</th>
                                        <th>Default</th>
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {Array.isArray(option.arguments) &&
                                    option.arguments.length > 0 ? (
                                    option.arguments.map((arg, i) => (
                                        <tr key={i}>
                                            <td><b>{arg.attribute}</b></td>
                                            <td>{arg.description}</td>
                                            <td>{arg.accepted}</td>
                                            <td>{arg.default}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="no-args">
                                            No arguments required
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}


            {/* <table>
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
            </table> */}
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
