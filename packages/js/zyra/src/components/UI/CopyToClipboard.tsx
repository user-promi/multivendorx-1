// External dependencies
import React, { useState } from 'react';
import { FieldComponent } from '../fieldUtils';
import '../../styles/web/UI/CopyToClipboard.scss';

// Types
interface CopyToClipboardProps {
    text?: string;
}

export const CopyToClipboardUI: React.FC<CopyToClipboardProps> = ({
    text
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <div className={`copy-to-clipboard`}>
            <code>{text}</code>

            <i
                className={
                    copied
                        ? 'adminfont-check'
                        : 'adminfont-vendor-form-copy'
                }
                onClick={handleCopy}
                title={copied ? 'Copied!' : 'Copy'}
            ></i>
        </div>
    );
};

const CopyToClipboard: FieldComponent = {
    render: ({ field }) => (
        <CopyToClipboardUI
            text={field.text}
        />
    ),
    validate: () => null,
};

export default CopyToClipboard;