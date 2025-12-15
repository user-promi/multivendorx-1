// BlockLayout.tsx
import React, { useState } from 'react';
import ImageGallery from './ImageGallery';

interface GalleryImage {
    url: string;
    alt: string;
}

interface LayoutBlock {
    id: string;
    type: 'text' | 'image' | 'heading' | 'spacer';
    content: string;
    image?: GalleryImage;
    settings: {
        alignment: 'left' | 'center' | 'right';
        padding: number;
        backgroundColor: string;
    };
}

const BlockLayout: React.FC = () => {
    const [ blocks, setBlocks ] = useState< LayoutBlock[] >( [] );
    const [ showImageGallery, setShowImageGallery ] = useState( false );
    const [ selectedBlock, setSelectedBlock ] = useState< string | null >(
        null
    );

    const addBlock = ( type: LayoutBlock[ 'type' ] ) => {
        const newBlock: LayoutBlock = {
            id: `block-${ Date.now() }`,
            type,
            content: '',
            settings: {
                alignment: 'left',
                padding: 10,
                backgroundColor: '#ffffff',
            },
        };
        setBlocks( ( prev ) => [ ...prev, newBlock ] );
        setSelectedBlock( newBlock.id );
    };

    const updateBlock = (
        blockId: string,
        updates: Partial< LayoutBlock >
    ) => {
        setBlocks( ( prev ) =>
            prev.map( ( block ) =>
                block.id === blockId ? { ...block, ...updates } : block
            )
        );
    };

    const deleteBlock = ( blockId: string ) => {
        setBlocks( ( prev ) =>
            prev.filter( ( block ) => block.id !== blockId )
        );
        if ( selectedBlock === blockId ) {
            setSelectedBlock( null );
        }
    };

    const handleImageSelect = ( images: GalleryImage[] ) => {
        const image = images[ 0 ];

        if ( ! image || ! selectedBlock ) {
            setShowImageGallery( false );
            return;
        }

        updateBlock( selectedBlock, {
            type: 'image',
            image,
            content: image.alt,
        } );

        setShowImageGallery( false );
    };

    const renderBlock = ( block: LayoutBlock ) => {
        switch ( block.type ) {
            case 'heading':
                return (
                    <h2
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={ ( e ) =>
                            updateBlock( block.id, {
                                content: e.currentTarget.textContent || '',
                            } )
                        }
                        style={ {
                            textAlign: block.settings.alignment,
                            padding: `${ block.settings.padding }px`,
                            backgroundColor: block.settings.backgroundColor,
                        } }
                    >
                        { block.content || 'Heading...' }
                    </h2>
                );

            case 'text':
                return (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={ ( e ) =>
                            updateBlock( block.id, {
                                content: e.currentTarget.textContent || '',
                            } )
                        }
                        style={ {
                            textAlign: block.settings.alignment,
                            padding: `${ block.settings.padding }px`,
                            backgroundColor: block.settings.backgroundColor,
                        } }
                    >
                        { block.content || 'Start typing...' }
                    </div>
                );

            case 'image':
                return (
                    <div
                        style={ {
                            textAlign: block.settings.alignment,
                            padding: `${ block.settings.padding }px`,
                            backgroundColor: block.settings.backgroundColor,
                        } }
                    >
                        { block.image ? (
                            <img
                                src={ block.image.url }
                                alt={ block.image.alt }
                                // style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        ) : (
                            <div
                                className="placeholder-image"
                                onClick={ () => {
                                    setSelectedBlock( block.id );
                                    setShowImageGallery( true );
                                } }
                            >
                                <i className="admin-font adminlib-image"></i>
                                <span>Click to add image</span>
                            </div>
                        ) }
                    </div>
                );

            case 'spacer':
                return (
                    <div
                        style={ {
                            height: `${ block.content || 20 }px`,
                            backgroundColor: block.settings.backgroundColor,
                        } }
                    ></div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="block-layout-editor">
            { /* Toolbar */ }
            <div className="block-toolbar">
                <button
                    className="admin-btn default-btn"
                    onClick={ () => addBlock( 'heading' ) }
                >
                    <i className="admin-font adminlib-heading"></i> Heading
                </button>
                <button
                    className="admin-btn default-btn"
                    onClick={ () => addBlock( 'text' ) }
                >
                    <i className="admin-font adminlib-text"></i> Text
                </button>
                <button
                    className="admin-btn default-btn"
                    onClick={ () => {
                        addBlock( 'image' );
                        setShowImageGallery( true );
                    } }
                >
                    <i className="admin-font adminlib-image"></i> Image
                </button>
                <button
                    className="admin-btn default-btn"
                    onClick={ () => addBlock( 'spacer' ) }
                >
                    <i className="admin-font adminlib-spacer"></i> Spacer
                </button>
            </div>

            { /* Blocks Container */ }
            <div className="blocks-container">
                { blocks.map( ( block ) => (
                    <div
                        key={ block.id }
                        className={ `block-wrapper ${
                            selectedBlock === block.id ? 'selected' : ''
                        }` }
                        onClick={ () => setSelectedBlock( block.id ) }
                    >
                        { renderBlock( block ) }

                        { /* Block Controls */ }
                        { selectedBlock === block.id && (
                            <div className="block-controls">
                                <button
                                    className="control-btn"
                                    onClick={ () => deleteBlock( block.id ) }
                                >
                                    <i className="admin-font adminlib-delete"></i>
                                </button>
                                <div className="drag-handle">
                                    <i className="admin-font adminlib-drag"></i>
                                </div>
                            </div>
                        ) }
                    </div>
                ) ) }

                { blocks.length === 0 && (
                    <div className="empty-blocks-state">
                        <i className="admin-font adminlib-layout"></i>
                        <p>
                            No blocks added yet. Start by adding a block from
                            the toolbar above.
                        </p>
                    </div>
                ) }
            </div>

            { /* Block Settings Panel */ }
            { selectedBlock && (
                <div className="block-settings-panel">
                    <h4>Block Settings</h4>
                    { blocks.find( ( b ) => b.id === selectedBlock ) && (
                        <BlockSettings
                            block={
                                blocks.find( ( b ) => b.id === selectedBlock )!
                            }
                            onUpdate={ ( updates ) =>
                                updateBlock( selectedBlock, updates )
                            }
                        />
                    ) }
                </div>
            ) }

            { /* Image Gallery Modal */ }
            { showImageGallery && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Select Image</h3>
                            <button
                                className="close-btn"
                                onClick={ () => setShowImageGallery( false ) }
                            >
                                <i className="admin-font adminlib-close"></i>
                            </button>
                        </div>
                        <ImageGallery onImageSelect={ handleImageSelect } />
                    </div>
                </div>
            ) }
        </div>
    );
};

// Block Settings Component
interface BlockSettingsProps {
    block: LayoutBlock;
    onUpdate: ( updates: Partial< LayoutBlock > ) => void;
}

const BlockSettings: React.FC< BlockSettingsProps > = ( {
    block,
    onUpdate,
} ) => {
    return (
        <div className="block-settings">
            <div className="setting-group">
                <label>Alignment</label>
                <select
                    value={ block.settings.alignment }
                    onChange={ ( e ) =>
                        onUpdate( {
                            settings: {
                                ...block.settings,
                                alignment: e.target.value as
                                    | 'left'
                                    | 'center'
                                    | 'right',
                            },
                        } )
                    }
                    className="basic-select"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>

            <div className="setting-group">
                <label>Padding</label>
                <input
                    type="number"
                    value={ block.settings.padding }
                    onChange={ ( e ) =>
                        onUpdate( {
                            settings: {
                                ...block.settings,
                                padding: parseInt( e.target.value ),
                            },
                        } )
                    }
                    className="basic-input"
                />
            </div>

            <div className="setting-group">
                <label>Background Color</label>
                <input
                    type="color"
                    value={ block.settings.backgroundColor }
                    onChange={ ( e ) =>
                        onUpdate( {
                            settings: {
                                ...block.settings,
                                backgroundColor: e.target.value,
                            },
                        } )
                    }
                    className="basic-input"
                />
            </div>

            { block.type === 'spacer' && (
                <div className="setting-group">
                    <label>Height (px)</label>
                    <input
                        type="number"
                        value={ block.content }
                        onChange={ ( e ) =>
                            onUpdate( { content: e.target.value } )
                        }
                        className="basic-input"
                    />
                </div>
            ) }
        </div>
    );
};

export default BlockLayout;
