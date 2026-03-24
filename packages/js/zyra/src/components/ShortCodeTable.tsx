// External dependencies
import React from 'react';

// Internal dependencies
import '../styles/web/ShortCodeTable.scss';
import { FieldComponent } from './fieldUtils';
import { CopyToClipboardUI } from './UI/CopyToClipboard';

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
    options: Option[];
    optionLabel?: string[];
    icon?: string; // Icon as string
}

const ShortCodeTableUI: React.FC<ShortCodeTableProps> = (props) => {
    const { options, optionLabel } = props;

    const headers = optionLabel;

    return (
        <>
            {options.map((option, index) => (
                <div className="shortcode-wrapper" key={option.label || index}>
                    <div className="shortcode-details">
                        <div className="shortcode-title">
                            { option.name } - <CopyToClipboardUI text={option.label}/>                            
                        </div>

                        <div className="des">{option.desc}</div>
                    </div>

                    <div className="shortcode-table">
                        <table>
                            {option.arguments &&
                                option.arguments.length > 0 && (
                                    <thead>
                                        <tr>
                                            {headers.map((header, idx) => (
                                                <th key={idx}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                )}
                            <tbody>
                                {Array.isArray(option.arguments) &&
                                option.arguments.length > 0 ? (
                                    option.arguments.map((arg, index) => (
                                        <tr key={index}>
                                            <td>
                                                <b>{arg.attribute}</b>
                                            </td>
                                            <td>{arg.description}</td>
                                            <td>{arg.accepted}</td>
                                            <td>{arg.default}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={headers.length}
                                            className="no-args"
                                        >
                                            No arguments required
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </>
    );
};

const ShortCodeTable: FieldComponent = {
    render: ({ field }) => (
        <ShortCodeTableUI
            key={field.key}
            icon={field.icon}
            options={Array.isArray(field.options) ? field.options : []}
            optionLabel={field.optionLabel} // Label header for the options column
        />
    ),
    validate: () => null,
};

export default ShortCodeTable;
