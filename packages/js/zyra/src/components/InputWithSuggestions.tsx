import React, { useState, useEffect, useRef } from "react";

interface InputWithSuggestionsProps {
    suggestions: string[];                 // list of suggestion strings
    value?: string[];                      // current added items
    onChange?: (list: string[]) => void;   // callback when list changes
    placeholder?: string;                  // input placeholder
    addButtonLabel?: string;               // text for Add button
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
    suggestions = [],
    value = [],
    onChange,
    placeholder = "Type something...",
    addButtonLabel = "Add",
}) => {
    const [inputValue, setInputValue] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [items, setItems] = useState<string[]>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal list with parent value
    useEffect(() => {
        setItems(value);
    }, [value]);

    // Filter suggestions as user types
    useEffect(() => {
        if (inputValue.trim() === "") {
            setFilteredSuggestions([]);
        } else {
            const filtered = suggestions.filter(
                (s) =>
                    s.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !items.includes(s)
            );
            setFilteredSuggestions(filtered);
        }
    }, [inputValue, suggestions, items]);

    // Close suggestions if clicked outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setFilteredSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || items.includes(trimmed)) return; // prevent duplicates
        const newList = [...items, trimmed];
        setItems(newList);
        setInputValue("");
        setFilteredSuggestions([]);
        onChange && onChange(newList);
    };

    const handleSelectSuggestion = (s: string) => {
        if (!items.includes(s)) {
            const newList = [...items, s];
            setItems(newList);
            onChange && onChange(newList);
        }
        setInputValue("");
        setFilteredSuggestions([]);
    };
    

    const handleRemove = (item: string) => {
        const newList = items.filter((i) => i !== item);
        setItems(newList);
        onChange && onChange(newList);
    };

    return (
        <div className="input-with-suggestions-wrapper" ref={wrapperRef}>
            <div className="input-row">
                <input
                    type="text"
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="button" onClick={handleAdd}>
                    {addButtonLabel}
                </button>
            </div>

            {/* Suggestions dropdown */}
            {filteredSuggestions.length > 0 && (
                <ul className="suggestions-list">
                    {filteredSuggestions.map((s, i) => (
                        <li key={i} onClick={() => handleSelectSuggestion(s)}>
                            {s}
                        </li>
                    ))}
                </ul>
            )}

            {/* Added items list */}
            <div className="added-list">
                {items.map((item, i) => (
                    <span key={i} className="added-item">
                        {item}
                        <span className="remove-item" onClick={() => handleRemove(item)}>
                            ×
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default InputWithSuggestions;
