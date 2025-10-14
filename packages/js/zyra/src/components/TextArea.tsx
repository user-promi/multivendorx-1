import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Types
interface TextAreaProps {
    id?: string;
    name?: string;
    value?: string | number;
    maxLength?: number;
    placeholder?: string;
    wrapperClass?: string;
    inputClass?: string;
    rowNumber?: number;
    colNumber?: number;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    tinymceApiKey?: string; // <-- API key passed via props
    onChange?: ( e: ChangeEvent<HTMLTextAreaElement> | string ) => void;
    onClick?: ( e: MouseEvent<HTMLTextAreaElement> ) => void;
    onMouseOver?: ( e: MouseEvent<HTMLTextAreaElement> ) => void;
    onMouseOut?: ( e: MouseEvent<HTMLTextAreaElement> ) => void;
    onFocus?: ( e: FocusEvent<HTMLTextAreaElement> ) => void;
    onBlur?: ( e: React.FocusEvent<HTMLTextAreaElement> ) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({
    inputClass,
    id,
    name,
    value,
    maxLength,
    placeholder,
    rowNumber = 4,
    colNumber = 50,
    proSetting,
    description,
    descClass,
    tinymceApiKey,
    onChange,
    onClick,
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
}) => {
    console.log(tinymceApiKey)
    const handleEditorChange = (content: string) => {
        if (onChange) onChange(content); // TinyMCE returns string
    };

    return (
        <>
            {tinymceApiKey ? (
                <Editor
                    apiKey={tinymceApiKey}
                    value={value as string}
                    init={{
                        height: rowNumber * 20,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | \
                            alignleft aligncenter alignright alignjustify | \
                            bullist numlist outdent indent | removeformat | help',
                    }}
                    onEditorChange={handleEditorChange}
                />
            ) : (
                <textarea
                    className={inputClass}
                    id={id}
                    name={name}
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    rows={rowNumber}
                    cols={colNumber}
                    onChange={onChange}
                    onClick={onClick}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
            )}

            {proSetting && (
                <span className="admin-pro-tag">
                    <i className="adminlib-pro-tag"></i>Pro
                </span>
            )}
            {description && (
                <p className={descClass} dangerouslySetInnerHTML={{ __html: description }}></p>
            )}
        </>
    );
};

export default TextArea;
