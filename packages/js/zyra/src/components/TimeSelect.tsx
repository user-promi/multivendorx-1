/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
// import '../styles/web/TimeSelect.scss';

interface TimeSelectProps {
    description?: string;
    wrapperClass?: string;
    descClass?: string;
    value: string;
    onChange: (value: string) => void;
    proChanged?: () => void;
    proSetting?: boolean;
    khali_dabba?: boolean;
    key?: string;
}

const TimeSelect: React.FC<TimeSelectProps> = ({
    description,
    descClass = '',
    value,
    key,
    onChange,
    proChanged,
    proSetting = false,
    khali_dabba,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (proSetting && !khali_dabba) {
            proChanged?.();
        } else {
            onChange(e.target.value);
        }
    };

    return (
        <>
            <div className="setting-form-input">
                <input
                    type="time"
                    className="basic-input"
                    value={value}
                    onChange={handleChange}
                    name={key}
                />
                {proSetting && !khali_dabba && (
                    <span className="admin-pro-tag">
                        <i className="adminlib-pro-tag"></i>Pro
                    </span>
                )}
            </div>
            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}
        </>
    );
};

export default TimeSelect;
