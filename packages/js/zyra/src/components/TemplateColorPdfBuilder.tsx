import React, { useMemo, useState } from 'react';
import '../styles/web/TemplateColorPdfBuilder.scss';

type ThemeVars = Record<string, string>;

// Default colors for invoice templates
const DEFAULT_COLORS: ThemeVars = {
  '--accent': '#6366f1',
  '--accent-secondary': '#22d3ee',
  '--bg-page': '#ffffff',
  '--bg-card': '#f9fafb',
  '--text-primary': '#111827',
  '--text-muted': '#6b7280',
  '--border-color': '#e5e7eb',
};

interface Template {
  key: string;
  label: string;
  preview?: string;
  html: string;
}

interface PresetPalette {
  key: string;
  label: string;
  vars: Partial<ThemeVars>;
}

interface Props {
  value?: {
    templateKey: string;
    themeVars: ThemeVars;
  };
  templates: Template[];
  presetPalettes: PresetPalette[];
  onChange?: (e: {
    target: {
      name: string;
      value: {
        templateKey: string;
        themeVars: ThemeVars;
      };
    };
  }) => void;
}

export default function TemplateColorPdfBuilder({
  value,
  templates,
  presetPalettes,
  onChange,
}: Props) {
  const [templateKey, setTemplateKey] = useState(
    value?.templateKey || templates[0]?.key
  );

  const [themeVars, setThemeVars] = useState<ThemeVars>({
    ...DEFAULT_COLORS,
    ...value?.themeVars,
  });

  const activeTemplate = useMemo(
    () => templates.find((t) => t.key === templateKey),
    [templateKey, templates]
  );

  const emitChange = (nextVars = themeVars, nextTemplate = templateKey) => {
    onChange?.({
      target: {
        name: 'store_color_settings',
        value: {
          templateKey: nextTemplate,
          themeVars: nextVars,
        },
      },
    });
  };

  /* ---------------- COLORS ---------------- */

  const updateColor = (key: string, val: string) => {
    const updated = { ...themeVars, [key]: val };
    setThemeVars(updated);
    emitChange(updated);
  };

  const applyPreset = (vars: Partial<ThemeVars>) => {
    const updated = { ...DEFAULT_COLORS, ...vars } as ThemeVars;
    setThemeVars(updated);
    emitChange(updated);
  };

  const resetColors = () => {
    setThemeVars(DEFAULT_COLORS);
    emitChange(DEFAULT_COLORS);
  };

  /* ---------------- TEMPLATE CHANGE ---------------- */

  const changeTemplate = (key: string) => {
    setTemplateKey(key);
    emitChange(themeVars, key);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* ---------------- TEMPLATE SELECT ---------------- */}
      <div className="color-setting two-column-layout">
        <div className="image-list">
          {templates.map((tpl) => (
            <div
              key={tpl.key}
              className={`image-thumbnail ${
                tpl.key === templateKey ? 'active' : ''
              }`}
              onClick={() => changeTemplate(tpl.key)}
            >
              {tpl.preview && <img src={tpl.preview} alt={tpl.label} />}
              <p>{tpl.label}</p>
            </div>
          ))}
        </div>

        <div className="image-preview">
          {activeTemplate?.preview && (
            <img src={activeTemplate.preview} />
          )}
        </div>
      </div>

      {/* ---------------- PRESET PALETTES ---------------- */}
      <div className="color-setting">
        <div className="color-palette-wrapper predefined">
          {presetPalettes.map((p) => (
            <div key={p.key} className="palette" onClick={() => applyPreset(p.vars)}>
              <div className="color">
                {Object.values(p.vars).map((c, i) => (
                  <div key={i} style={{ background: c }} />
                ))}
              </div>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        {/* ---------------- CUSTOM COLORS ---------------- */}
        <div className="custom">
          <div className="palette">
            {Object.entries(themeVars).map(([key, val]) => (
              <div key={key} className="color-wrapper">
                <input
                  type="color"
                  value={val}
                  onChange={(e) => updateColor(key, e.target.value)}
                />
                <label>
                  <div>{key.replace('--', '').replace('-', ' ')}</div>
                  <span>{val}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mvx-color-actions">
            <span onClick={resetColors}>Reset</span>
          </div>
        </div>
      </div>

      {/* ---------------- LIVE PREVIEW ---------------- */}
      <div
        className="preview-wrapper"
        style={themeVars as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: activeTemplate?.html || '' }}
      />
    </>
  );
}
