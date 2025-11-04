/**
 * External dependencies
 */
import React from 'react';

// Types
interface SectionProps {
    wrapperClass: string;
    hint?: string;
    value?: string;
    description?: string;
}

const Section: React.FC<SectionProps> = ({ wrapperClass, hint, value, description }) => {
    return (
        <>
            <div className={wrapperClass}>
                <div className="divider-section">
                    {hint && (
                        <p
                            className="title"
                            dangerouslySetInnerHTML={{ __html: hint }}
                        ></p>
                    )}
                    <div className="desc">{description}</div>
                    {value && <span>{value}</span>}
                </div>
            </div>
        </>
    );
};

export default Section;
