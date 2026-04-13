// ==============================
// TYPES (minimal required)
// ==============================

export type BlockType =
    | 'richtext'
    | 'heading'
    | 'image'
    | 'button'
    | 'divider'
    | 'columns'
    | 'section';

export interface Block {
    id: number;
    type: BlockType;
    text?: string;
    html?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    src?: string;
    alt?: string;
    url?: string;
    style?: Record<string, any>;
    columns?: Block[][];
}

// ==============================
// STYLE → INLINE CSS
// ==============================

const styleToString = (style: Record<string, any> = {}) => {
    return Object.entries(style)
        .map(([key, val]) => {
            if (val === undefined || val === null) return '';

            const cssKey = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

            if (typeof val === 'number') {
                return `${cssKey}:${val}rem`;
            }

            return `${cssKey}:${val}`;
        })
        .filter(Boolean)
        .join(';');
};

// ==============================
// MAIN FUNCTION
// ==============================

export const renderBlocksToHTML = (blocks: Block[]): string => {
    return blocks.map(renderBlock).join('');
};

// ==============================
// BLOCK RENDERER
// ==============================

const renderBlock = (block: Block): string => {
    const style = styleToString(block.style);

    switch (block.type) {
        case 'heading':
            return `<h${block.level || 1} style="${style}">
                ${block.text || ''}
            </h${block.level || 1}>`;

        case 'richtext':
            return `<div style="${style}">
                ${block.html || ''}
            </div>`;

        case 'image':
            return `<img src="${block.src || ''}" alt="${block.alt || ''}" style="${style}" />`;

        case 'button':
            return `<a href="${block.url || '#'}" style="${style};display:inline-block;text-decoration:none;">
                ${block.text || 'Click'}
            </a>`;

        case 'divider':
            return `<hr style="${style}" />`;

        case 'columns':
            return renderColumns(block);

        case 'section':
            return `<div style="${style}">
                ${(block.columns || [])
                    .flat()
                    .map(renderBlock)
                    .join('')}
            </div>`;

        default:
            return '';
    }
};

// ==============================
// COLUMNS (TABLE FOR EMAIL)
// ==============================

const renderColumns = (block: Block): string => {
    const cols = block.columns || [];

    return `
        <table width="100%" cellpadding="0" cellspacing="0" style="${styleToString(block.style)}">
            <tr>
                ${cols
                    .map(
                        (col) => `
                    <td valign="top" style="padding:10px;">
                        ${col.map(renderBlock).join('')}
                    </td>
                `
                    )
                    .join('')}
            </tr>
        </table>
    `;
};