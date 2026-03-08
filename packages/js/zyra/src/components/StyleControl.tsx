// External dependencies
import React, { useState } from 'react';
import { ToggleSettingUI } from './ToggleSetting';
import Card from './UI/Card';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';

interface StyleControlsProps {
  style?: any;
  onChange: (style: any) => void;
  includeTextStyles?: boolean;
}

const StyleControls: React.FC<StyleControlsProps> = ({
  style = {},
  onChange,
  includeTextStyles = true,
}) => {

  return (
    <>
      {/* Text Styles - Conditionally included */}
      {includeTextStyles && (
        <Card toggle defaultExpanded={true} title="Text">
          <FormGroupWrapper>
            <FormGroup label="Text Align">
              <ToggleSettingUI
                options={[
                  {
                    key: 'left',
                    value: 'left',
                    icon: 'left-align'
                  },
                  {
                    key: 'center',
                    value: 'center',
                    icon: 'center-align'
                  },
                  {
                    key: 'right',
                    value: 'right',
                    icon: 'right-align'
                  },
                  {
                    key: 'justify',
                    value: 'justify',
                    icon: 'justify-align'
                  },
                ]}
                value={style.textAlign || 'left'}
                onChange={(value) =>
                  onChange({ ...style, textAlign: value as 'left' | 'center' | 'right' | 'justify' })
                }
              />
            </FormGroup>

            {/* font-size */}
            <FormGroup cols={2} label="Font Size (rem)">
              <input
                type="number"
                value={style.fontSize || 16}
                className="basic-input"
                onChange={(e) =>
                  onChange({ ...style, fontSize: Number(e.target.value) })
                }
              />
            </FormGroup>

            <FormGroup cols={2} label="Line Height">
              <input
                type="number"
                min={1}
                max={3}
                step={0.1}
                value={style.lineHeight || 1.5}
                className="basic-input"
                onChange={(e) =>
                  onChange({ ...style, lineHeight: Number(e.target.value) })
                }
              />
            </FormGroup>

            {/* font weight */}
            <FormGroup cols={2} label="Font Weight">
              <select
                value={style.fontWeight || 'normal'}
                className="basic-input"
                onChange={(e) =>
                  onChange({ ...style, fontWeight: e.target.value })
                }
              >
                <option value="300">Light (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="bold">Bold (700)</option>
              </select>
            </FormGroup>

            <FormGroup cols={2} label="Text Decoration">
              <select
                value={style.textDecoration || 'none'}
                className="basic-input"
                onChange={(e) =>
                  onChange({ ...style, textDecoration: e.target.value })
                }
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="overline">Overline</option>
                <option value="line-through">Line Through</option>
              </select>
            </FormGroup>
          </FormGroupWrapper>
        </Card>
      )}

      {/* Background Group */}
      <Card toggle defaultExpanded={true} title="Color">
        <FormGroupWrapper>
          <FormGroup label="Background Color">
            <input
              type="color"
              className="basic-input"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) =>
                onChange({ ...style, backgroundColor: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup label="Text Color">
            <input
              type="color"
              value={style.color || '#000000'}
              className="basic-input"
              onChange={(e) =>
                onChange({ ...style, color: e.target.value })
              }
            />
          </FormGroup>
        </FormGroupWrapper>
      </Card>

      {/* Padding & Margin Group */}
      <Card toggle defaultExpanded={true} title="Spacing">
        <FormGroupWrapper>
          {/* Padding */}
          <FormGroup label="Padding">
            <div className="spacing-controls">
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.paddingTop ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, paddingTop: Number(e.target.value) })
                  }
                />
                <label>Top</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.paddingRight ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, paddingRight: Number(e.target.value) })
                  }
                />
                <label>Right</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.paddingBottom ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, paddingBottom: Number(e.target.value) })
                  }
                />
                <label>Bottom</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.paddingLeft ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, paddingLeft: Number(e.target.value) })
                  }
                />
                <label>Left</label>
              </div>
            </div>
          </FormGroup>

          {/* Margin */}
          <FormGroup label="Margin">
            <div className="spacing-controls">
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.marginTop ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, marginTop: Number(e.target.value) })
                  }
                />
                <label>Top</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.marginRight ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, marginRight: Number(e.target.value) })
                  }
                />
                <label>Right</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.marginBottom ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, marginBottom: Number(e.target.value) })
                  }
                />
                <label>Bottom</label>
              </div>
              <div className="spacing-input">
                <input
                  type="number"
                  min={0}
                  value={style.marginLeft ?? 0}
                  className="basic-input"
                  onChange={(e) =>
                    onChange({ ...style, marginLeft: Number(e.target.value) })
                  }
                />
                <label>Left</label>
              </div>
            </div>
          </FormGroup>
        </FormGroupWrapper>
      </Card>

      {/* Border Group */}
      <Card toggle defaultExpanded={true} title="Border">
        <FormGroupWrapper>
          <FormGroup label="Border Width (rem)">
            <input
              type="number"
              min={0}
              value={style.borderWidth ?? 0}
              className="basic-input"
              onChange={(e) =>
                onChange({ ...style, borderWidth: Number(e.target.value) })
              }
            />
          </FormGroup>
          <FormGroup label="Border Radius (rem)">
            <input
              type="number"
              min={0}
              value={style.borderRadius ?? 0}
              className="basic-input"
              onChange={(e) =>
                onChange({ ...style, borderRadius: Number(e.target.value) })
              }
            />
          </FormGroup>
          <FormGroup label="Border Style">
            <select
              value={style.borderStyle || 'solid'}
              className="basic-input"
              onChange={(e) =>
                onChange({ ...style, borderStyle: e.target.value })
              }
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="none">None</option>
            </select>
          </FormGroup>
          <FormGroup label="Border Color">
            <input
              type="color"
              value={style.borderColor || '#000000'}
              className="basic-input"
              onChange={(e) =>
                onChange({ ...style, borderColor: e.target.value })
              }
            />
          </FormGroup>
        </FormGroupWrapper>
      </Card>
    </>
  );
};

export default StyleControls;