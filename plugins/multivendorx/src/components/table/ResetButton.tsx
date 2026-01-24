import React from 'react';
import './table.scss';
interface ResetButtonProps {
    onClick: () => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({
    onClick,
    label = 'Reset',
    disabled = false,
    className = '',
}) => {
    return (
        <button
            type="button"
            className={`reset-button ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default ResetButton;
