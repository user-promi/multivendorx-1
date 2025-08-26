import React, { ChangeEvent, useState, useEffect } from 'react';
import "../styles/web/ColorSettingInput.scss";

interface CustomColors {
    buttonText: string;
    buttonBg: string;
    buttonBorder: string;
    buttonHoverText: string;
    buttonHoverBg: string;
    buttonHoverBorder: string;
    sidebarText: string;
    sidebarBg: string;
    sidebarActiveText: string;
    sidebarActiveBg: string;
}

interface PaletteOption {
    key?: string;
    value?: string;
    label?: string;
    colors?: Partial<CustomColors>;
}

interface ColorSettingProps {
    wrapperClass?: string;
    inputClass?: string;
    descClass?: string;
    description?: string;
    predefinedOptions: PaletteOption[];
    value?: { selectedPalette: string; colors: Partial<CustomColors> }; // object from DB
    onChange?: (e: { target: { name: string; value: any } }) => void;
    idPrefix?: string;
    showPreview?: boolean;
}

const ColorSettingInput: React.FC<ColorSettingProps> = (props) => {
    // Initialize selectedPalette from DB value or default to first option
    const initialPalette = props.value?.selectedPalette || (props.predefinedOptions[0]?.value ?? '');
    const initialColors = props.value?.colors || {};

    const [mode, setMode] = useState<'predefined' | 'custom'>(initialPalette === 'custom' ? 'custom' : 'predefined');
    const [selectedPalette, setSelectedPalette] = useState(initialPalette);
    const [selectedColors, setSelectedColors] = useState<Partial<CustomColors>>(initialColors);
    const [customColors, setCustomColors] = useState<CustomColors>({
        buttonText: '#ffffff',
        buttonBg: '#007cba',
        buttonBorder: '#005f8d',
        buttonHoverText: '#ffffff',
        buttonHoverBg: '#005f8d',
        buttonHoverBorder: '#00486a',
        sidebarText: '#ffffff',
        sidebarBg: '#202528',
        sidebarActiveText: '#ffffff',
        sidebarActiveBg: '#3f85b9',
        ...initialColors,
    });

    useEffect(() => {
        if (selectedPalette !== 'custom') {
            const selectedOption = props.predefinedOptions.find(opt => opt.value === selectedPalette);
            setSelectedColors(selectedOption?.colors || {});
        }
    }, [selectedPalette, props.predefinedOptions]);

    const handlePaletteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedPalette(value);

        const option = props.predefinedOptions.find(opt => opt.value === value);
        const colors = option?.colors || {};

        setSelectedColors(colors);

        props.onChange?.({
            target: {
                name: 'vendor_color_settings',
                value: {
                    selectedPalette: value,
                    colors,
                }
            }
        });
    };

    const handleCustomChange = (field: keyof CustomColors, value: string) => {
        const updated = { ...customColors, [field]: value };
        setCustomColors(updated);
        setSelectedColors(updated);
        setSelectedPalette('custom');

        props.onChange?.({
            target: {
                name: 'vendor_color_settings',
                value: {
                    selectedPalette: 'custom',
                    colors: updated,
                }
            }
        });
    };

    return (
        <>
            <div className={props.wrapperClass}>
                {/* Toggle Mode */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setMode('predefined')}
                        className="admin-btn btn-purple"
                    >
                        Pre-defined Palette
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('custom')}
                        className="admin-btn btn-purple"
                    >
                        Custom Palette
                    </button>
                </div>

                {/* Predefined Palettes */}
                {mode === 'predefined' && props.predefinedOptions.map(option => {
                    const checked = selectedPalette === option.value;
                    return (
                        <div key={option.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <input
                                className={props.inputClass}
                                id={`${props.idPrefix}-${option.key}`}
                                type="radio"
                                name="vendor_color_scheme_picker"
                                checked={checked}
                                value={option.value}
                                onChange={handlePaletteChange}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor={`${props.idPrefix}-${option.key}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: checked ? '2px solid #007cba' : '1px solid #ccc',
                                    borderRadius: '6px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: checked ? '#f0faff' : '#fff',
                                    width: '240px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{option.label}</span>
                                <div style={{ display: 'flex', width: '70px', height: '18px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                    {option.colors && Object.values(option.colors).map((c, i) => (
                                        <div key={i} style={{ flex: 1, backgroundColor: c }}></div>
                                    ))}
                                </div>
                            </label>
                        </div>
                    );
                })}

                {/* Custom Palette */}
                {mode === 'custom' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {Object.entries(customColors).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 500 }}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                </label>
                                <input
                                    type="color"
                                    value={val}
                                    onChange={(e) => handleCustomChange(key as keyof CustomColors, e.target.value)}
                                    style={{ width: '100%', height: '36px', cursor: 'pointer' }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Live Preview */}
            {props.showPreview && (
                <div className="preview-wrapper">
                    {/* Sidebar */}
                    <div
                        style={{
                            backgroundColor: selectedColors.sidebarBg,
                            color: selectedColors.sidebarText,
                            width: '110px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        <div>Dashboard</div>
                        <div>Products</div>
                        <div>Orders</div>
                        <div>Coupons</div>
                    </div>

                    {/* Content Area */}
                    <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9' }}>
                        <h4 style={{ marginBottom: '10px' }}>Dashboard</h4>
                        <button
                            style={{
                                backgroundColor: selectedColors.buttonBg,
                                color: selectedColors.buttonText,
                                border: `1px solid ${selectedColors.buttonBorder}`,
                                padding: '8px 14px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Button
                        </button>
                    </div>
                </div>
            )}

            {props.description && (
                <p className={props.descClass} dangerouslySetInnerHTML={{ __html: props.description }}></p>
            )}
        </>
    );
};

export default ColorSettingInput;
