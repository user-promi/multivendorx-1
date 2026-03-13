import React from "react";
import { FieldComponent } from "./types";

interface ActionButtonProps {
  value?: string;
  length?: number;
  onChange: (value: string) => void;
}

const generateRandomKey = (len: number): string =>
  Array.from({ length: len }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 62)
    )
  ).join("");

const ActionButtonUI: React.FC<ActionButtonProps> = ({
  value = "",
  length = 8,
  onChange,
}) => {
  const handleGenerate = () => {
    const key = generateRandomKey(length);
    onChange(key);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  const handleDelete = () => {
    onChange("");
  };

  if (!value) {
    return (
      <button type="button" onClick={handleGenerate}>
        Generate
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={handleCopy}>
        Copy
      </button>

      <button type="button" onClick={handleDelete}>
        Delete
      </button>
    </>
  );
};

const ActionButton: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <ActionButtonUI
            value={value}
            length={field.length}
            onChange={onChange}
        />
    ),
};

export default ActionButton;