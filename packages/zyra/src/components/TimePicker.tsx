import React from "react";
import HoverInputRender from "./HoverInputRender";

interface TimepickerProps {
    formField: { label: string };
    onChange: (field: string, value: string) => void;
}

const Timepicker: React.FC<TimepickerProps> = ({ formField, onChange }) => {
    return (
        <HoverInputRender
            label={formField.label}
            placeholder="Select time"
            onLabelChange={(newLabel) => onChange("label", newLabel)}
            renderStaticContent={({ label }) => (
                <div className="edit-form-wrapper">
                    <p>{label}</p>
                    <div className="settings-form-group-radio">
                        <input type="time" readOnly />
                    </div>
                </div>
            )}
            renderEditableContent={({ label, onLabelChange }) => (
                <>
                    <input
                        className="input-label textArea-label"
                        type="text"
                        value={label}
                        onChange={(event) => onLabelChange(event.target.value)}
                    />
                    <input type="time" readOnly />
                </>
            )}
        />
    );
};

export default Timepicker;
