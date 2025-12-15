/**
 * External dependencies
 */
import React from 'react';

// Types
interface BlockTextProps {
    blockTextClass: string;
    value: string;
    title?: string;
}

const BlockText: React.FC< BlockTextProps > = ( {
    blockTextClass,
    value,
    title,
} ) => {
    return (
        <>
            <div className={ blockTextClass }>
                <div className="metabox-note-wrapper">
                    <i className="adminlib-info"></i>

                    <div className="details">
                        <div className="title">{ title }</div>
                        <p dangerouslySetInnerHTML={ { __html: value } }></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlockText;
