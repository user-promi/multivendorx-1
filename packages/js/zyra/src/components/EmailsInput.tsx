// External dependencies
import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

// Internal dependencies
import '../styles/web/EmailsInput.scss';
import { BasicInputUI } from './BasicInput';

export interface EmailsInputProps {
    mode?: 'single' | 'multiple';
    max?: number;
    value?: string[];
    primary?: string;
    enablePrimary?: boolean;
    placeholder?: string;
    onChange?: (emails: string[], primary: string) => void;
}

const EmailsInput = forwardRef<HTMLInputElement, EmailsInputProps>(
    (
        {
            mode = 'multiple',
            max,
            value = [],
            primary = '',
            enablePrimary = true,
            placeholder = 'Enter email...',
            onChange,
        },
        ref
    ) => {
        const [emails, setEmails] = useState<string[]>(value);
        const [primaryEmail, setPrimaryEmail] = useState<string>(
            enablePrimary ? primary : ''
        );

        const [inputValue, setInputValue] = useState('');

        const inputRef = useRef<HTMLInputElement>(null);

        // Sync when parent updates props
        useEffect(() => {
            setEmails(value);
        }, [value]);

        useEffect(() => {
            setPrimaryEmail(enablePrimary ? primary : '');
        }, [primary, enablePrimary]);

        useEffect(() => {
            if (mode === 'single' && !emails[0]) {
                setInputValue('');
            }
        }, [emails, mode]);

        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const isValidEmail = useCallback((email: string) =>
            /^\S+@\S+\.([a-zA-Z]{2,})$/.test(email), []);

        const addEmail = useCallback(
            (email: string) => {
                email = email.trim();

                if (
                    !email ||
                    !isValidEmail(email) ||
                    emails.includes(email) ||
                    (max && emails.length >= max)
                ) {
                    return;
                }

                const updated = [...emails, email];
                setEmails(updated);

                // Only handle primary logic for multiple mode
                let newPrimary = primaryEmail;
                if (mode === 'multiple' && enablePrimary) {
                    // Set as primary if it's the first email
                    if (emails.length === 0 && !primaryEmail) {
                        newPrimary = email;
                        setPrimaryEmail(email);
                    }
                }

                setInputValue('');
                onChange?.(updated, mode === 'multiple' && enablePrimary ? newPrimary : '');
            },
            [emails, max, isValidEmail, enablePrimary, mode, primaryEmail, onChange]
        );

        const removeEmail = useCallback(
            (email: string) => {
                const updated = emails.filter((e) => e !== email);

                let newPrimary = primaryEmail;

                if (enablePrimary && primaryEmail === email) {
                    newPrimary = updated[0] || '';
                    setPrimaryEmail(newPrimary);
                }

                setEmails(updated);
                onChange?.(updated, enablePrimary ? newPrimary : '');
            },
            [emails, primaryEmail, enablePrimary, onChange]
        );

        const togglePrimary = useCallback(
            (email: string) => {
                if (!enablePrimary || mode === 'single') return;
                setPrimaryEmail(email);
                onChange?.(emails, email);
            },
            [enablePrimary, mode, emails, onChange]
        );

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (['Enter', ',', ' '].includes(e.key)) {
                e.preventDefault();
                addEmail(inputValue);
            }
        };

        const isInputReadOnly = mode === 'single' && emails.length > 0;

        const showSuggestion = !isInputReadOnly &&
            inputValue &&
            isValidEmail(inputValue) &&
            (mode === 'multiple' ?
                (!inputValue.endsWith(' ') &&
                    !inputValue.endsWith(',') &&
                    !emails.includes(inputValue.trim()))
                : true
            );

        return (
            <div
                className="emails-section"
                onClick={() => !isInputReadOnly && inputRef.current?.focus()}
            >
                {emails.map((email) => (
                    <div
                        className={`email ${enablePrimary && primaryEmail === email ? 'primary' : ''}`}
                        key={email}
                    >
                        {enablePrimary && mode === 'multiple' && (
                            <i
                                className={`stat-icon adminfont-star${primaryEmail === email ? ' primary' : '-o'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePrimary(email);
                                }}
                            ></i>
                        )}
                        <span>{email}</span>
                        <i
                            className="adminfont-close close-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(email);
                            }}
                        ></i>
                    </div>
                ))}

                <div className="input-wrapper">
                    <BasicInputUI
                        ref={inputRef}
                        type={mode === 'single' ? 'email' : 'text'}
                        inputClass="email-input"
                        value={inputValue}
                        placeholder={mode === 'multiple' && emails.length > 0 ? '' : placeholder}
                        onChange={(val) => setInputValue(String(val))}
                        onKeyDown={handleKeyDown}
                        readOnly={isInputReadOnly}
                    />

                    {showSuggestion && (
                        <div
                            className="inline-suggestion"
                            onClick={() => addEmail(inputValue.trim())}
                        >
                            <i className="adminfont-mail orange"></i> {inputValue.trim()}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default EmailsInput;
