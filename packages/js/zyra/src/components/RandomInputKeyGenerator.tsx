import React from "react";
import { FieldComponent } from "./types";

interface RandomInputKeyGeneratorProps {
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

export const RandomInputKeyGeneratorUI: React.FC<RandomInputKeyGeneratorProps> = ({
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

const RandomInputKeyGenerator: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <RandomInputKeyGeneratorUI
            value={value}
            length={field.length}
            onChange={onChange}
        />
    ),
};

export default RandomInputKeyGenerator;