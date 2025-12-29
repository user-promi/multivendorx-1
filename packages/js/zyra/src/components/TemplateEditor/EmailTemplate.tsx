import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
interface Block {
  id: string;
  type: 'text' | 'image' | 'container' | 'heading' | 'button' | 'divider' | 'columns' | 'video' | 'form' | 'social' | 'spacer' | 'icon';
  content: string;
  style: React.CSSProperties;
  props?: Record<string, any>;
  children?: Block[];
  parentId?: string;
}

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: 'landing' | 'email' | 'blog' | 'ecommerce';
  blocks: Block[];
}

interface HistoryItem {
  blocks: Block[];
  timestamp: number;
}

// Initial templates library
const initialTemplates: Template[] = [
  {
    id: 'hero-template',
    name: 'Hero Section',
    thumbnail: 'https://via.placeholder.com/300x200/6366F1/FFFFFF?text=Hero',
    category: 'landing',
    blocks: [
      {
        id: 'hero-container',
        type: 'container',
        content: '',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px 20px',
          textAlign: 'center',
          color: 'white'
        },
        children: [
          {
            id: 'hero-heading',
            type: 'heading',
            content: 'Build Amazing Websites',
            style: {
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }
          },
          {
            id: 'hero-text',
            type: 'text',
            content: 'Create beautiful, responsive websites with our drag & drop builder. No code required.',
            style: {
              fontSize: '20px',
              marginBottom: '30px',
              opacity: 0.9
            }
          },
          {
            id: 'hero-button',
            type: 'button',
            content: 'Get Started Free',
            style: {
              backgroundColor: '#fff',
              color: '#6366F1',
              padding: '12px 30px',
              borderRadius: '30px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    thumbnail: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Features',
    category: 'landing',
    blocks: [
      {
        id: 'features-container',
        type: 'container',
        content: '',
        style: {
          padding: '60px 20px',
          backgroundColor: '#f8fafc'
        },
        children: [
          {
            id: 'section-heading',
            type: 'heading',
            content: 'Our Features',
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '40px',
              color: '#1e293b'
            }
          },
          {
            id: 'features-columns',
            type: 'columns',
            content: '',
            style: { display: 'grid', gap: '30px' },
            props: { columns: 3 },
            children: [
              {
                id: 'feature-1',
                type: 'container',
                content: '',
                style: {
                  padding: '30px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-1-icon',
                    type: 'icon',
                    content: '🚀',
                    style: { fontSize: '40px', marginBottom: '20px' }
                  },
                  {
                    id: 'feature-1-heading',
                    type: 'heading',
                    content: 'Fast & Easy',
                    style: {
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#1e293b'
                    }
                  }
                ]
              },
              {
                id: 'feature-2',
                type: 'container',
                content: '',
                style: {
                  padding: '30px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-2-icon',
                    type: 'icon',
                    content: '🎨',
                    style: { fontSize: '40px', marginBottom: '20px' }
                  },
                  {
                    id: 'feature-2-heading',
                    type: 'heading',
                    content: 'Beautiful Design',
                    style: {
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#1e293b'
                    }
                  }
                ]
              },
              {
                id: 'feature-3',
                type: 'container',
                content: '',
                style: {
                  padding: '30px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-3-icon',
                    type: 'icon',
                    content: '📱',
                    style: { fontSize: '40px', marginBottom: '20px' }
                  },
                  {
                    id: 'feature-3-heading',
                    type: 'heading',
                    content: 'Responsive',
                    style: {
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#1e293b'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    thumbnail: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Form',
    category: 'landing',
    blocks: [
      {
        id: 'form-container',
        type: 'container',
        content: '',
        style: {
          padding: '60px 20px',
          backgroundColor: '#fef3c7'
        },
        children: [
          {
            id: 'form-heading',
            type: 'heading',
            content: 'Contact Us',
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '30px',
              color: '#92400e'
            }
          },
          {
            id: 'form-wrapper',
            type: 'form',
            content: '',
            style: {
              maxWidth: '600px',
              margin: '0 auto',
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            },
            children: [
              {
                id: 'form-fields',
                type: 'container',
                content: '',
                style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                children: [
                  {
                    id: 'name-input',
                    type: 'text',
                    content: 'Name',
                    style: {
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    },
                    props: { placeholder: 'Enter your name', type: 'input' }
                  },
                  {
                    id: 'email-input',
                    type: 'text',
                    content: 'Email',
                    style: {
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    },
                    props: { placeholder: 'Enter your email', type: 'input' }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Available blocks library
const blockLibrary = [
  {
    category: 'Layout',
    blocks: [
      { type: 'container', icon: '📦', name: 'Container', description: 'Flexible container for grouping elements' },
      { type: 'columns', icon: '📐', name: 'Columns', description: 'Multi-column layout' },
      { type: 'divider', icon: '➖', name: 'Divider', description: 'Horizontal divider line' },
      { type: 'spacer', icon: '⏸️', name: 'Spacer', description: 'Vertical or horizontal space' }
    ]
  },
  {
    category: 'Basic',
    blocks: [
      { type: 'heading', icon: '🏷️', name: 'Heading', description: 'Add H1-H6 headings' },
      { type: 'text', icon: '📝', name: 'Text', description: 'Text paragraph' },
      { type: 'button', icon: '🔘', name: 'Button', description: 'Call to action button' },
      { type: 'image', icon: '🖼️', name: 'Image', description: 'Add images' }
    ]
  },
  {
    category: 'Media',
    blocks: [
      { type: 'video', icon: '🎥', name: 'Video', description: 'Embed video player' },
      { type: 'icon', icon: '⭐', name: 'Icon', description: 'Add icons' }
    ]
  },
  {
    category: 'Advanced',
    blocks: [
      { type: 'form', icon: '📋', name: 'Form', description: 'Contact form with fields' },
      { type: 'social', icon: '📱', name: 'Social Links', description: 'Social media icons' }
    ]
  }
];

// Main Page Builder Component
const EmailTemplate: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [templates] = useState<Template[]>(initialTemplates);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDragging, setIsDragging] = useState(false);
  const [dragBlock, setDragBlock] = useState<Block | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Add to history
  const addToHistory = useCallback((newBlocks: Block[]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), { blocks: JSON.parse(JSON.stringify(newBlocks)), timestamp: Date.now() }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1].blocks);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1].blocks);
    }
  };

  // Load template
  const loadTemplate = (template: Template) => {
    const newBlocks = JSON.parse(JSON.stringify(template.blocks));
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    setSelectedBlockId(null);
  };

  // Create new block
  const createNewBlock = (type: Block['type']): Block => {
    const baseBlock: Block = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: '',
      style: {}
    };

    switch (type) {
      case 'container':
        return {
          ...baseBlock,
          style: {
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            minHeight: '100px'
          },
          children: []
        };
      case 'heading':
        return {
          ...baseBlock,
          content: 'New Heading',
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '10px 0'
          }
        };
      case 'text':
        return {
          ...baseBlock,
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          style: {
            fontSize: '16px',
            color: '#475569',
            lineHeight: '1.6',
            margin: '10px 0'
          }
        };
      case 'button':
        return {
          ...baseBlock,
          content: 'Click Me',
          style: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-block'
          }
        };
      case 'image':
        return {
          ...baseBlock,
          content: '',
          style: {
            width: '100%',
            height: 'auto',
            borderRadius: '8px'
          },
          props: {
            src: 'https://via.placeholder.com/400x300/94a3b8/FFFFFF?text=Image'
          }
        };
      case 'columns':
        return {
          ...baseBlock,
          style: {
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          props: { columns: 2 },
          children: [
            {
              id: `column-1-${Date.now()}`,
              type: 'container',
              content: '',
              style: { padding: '20px', backgroundColor: '#f1f5f9' },
              children: []
            },
            {
              id: `column-2-${Date.now()}`,
              type: 'container',
              content: '',
              style: { padding: '20px', backgroundColor: '#f1f5f9' },
              children: []
            }
          ]
        };
      case 'divider':
        return {
          ...baseBlock,
          style: {
            borderTop: '2px solid #e2e8f0',
            margin: '30px 0',
            width: '100%'
          }
        };
      case 'spacer':
        return {
          ...baseBlock,
          style: {
            height: '50px',
            width: '100%'
          }
        };
      default:
        return baseBlock;
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, block: Block) => {
    e.dataTransfer.setData('block-type', block.type);
    e.dataTransfer.setData('block-id', block.id);
    setIsDragging(true);
    setDragBlock(block);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDrop = (e: React.DragEvent, parentId?: string, index?: number) => {
    e.preventDefault();
    setIsDragging(false);
    setDropPosition(null);
    
    const blockType = e.dataTransfer.getData('block-type') as Block['type'];
    const draggedBlockId = e.dataTransfer.getData('block-id');
    
    let newBlock: Block;
    
    if (draggedBlockId) {
      // Moving existing block
      const draggedBlock = findBlockById(blocks, draggedBlockId);
      if (!draggedBlock) return;
      
      // Remove from old position
      const updatedBlocks = removeBlockById(blocks, draggedBlockId);
      
      // Clone the block
      newBlock = { ...draggedBlock, id: `${draggedBlock.type}-${Date.now()}` };
    } else {
      // Creating new block
      newBlock = createNewBlock(blockType);
    }
    
    // Insert at new position
    let finalBlocks: Block[];
    if (parentId) {
      finalBlocks = insertBlockIntoParent(blocks, parentId, newBlock, index);
    } else {
      finalBlocks = [...blocks];
      finalBlocks.splice(index || blocks.length, 0, newBlock);
    }
    
    setBlocks(finalBlocks);
    addToHistory(finalBlocks);
    setSelectedBlockId(newBlock.id);
  };

  // Block manipulation helpers
  const findBlockById = (blocks: Block[], id: string): Block | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlockById(block.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeBlockById = (blocks: Block[], id: string): Block[] => {
    return blocks.filter(block => {
      if (block.id === id) return false;
      if (block.children) {
        block.children = removeBlockById(block.children, id);
      }
      return true;
    });
  };

  const insertBlockIntoParent = (blocks: Block[], parentId: string, newBlock: Block, index?: number): Block[] => {
    return blocks.map(block => {
      if (block.id === parentId) {
        const children = block.children || [];
        const newChildren = [...children];
        newChildren.splice(index || children.length, 0, newBlock);
        return { ...block, children: newChildren };
      }
      if (block.children) {
        return { ...block, children: insertBlockIntoParent(block.children, parentId, newBlock, index) };
      }
      return block;
    });
  };

  // Update block
  const updateBlock = (id: string, updates: Partial<Block>) => {
    const updateBlockRecursive = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === id) {
          return { ...block, ...updates };
        }
        if (block.children) {
          return { ...block, children: updateBlockRecursive(block.children) };
        }
        return block;
      });
    };

    const newBlocks = updateBlockRecursive(blocks);
    setBlocks(newBlocks);
    addToHistory(newBlocks);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    const newBlocks = removeBlockById(blocks, id);
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  // Duplicate block
  const duplicateBlock = (id: string) => {
    const blockToDuplicate = findBlockById(blocks, id);
    if (!blockToDuplicate) return;

    const duplicatedBlock = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: `${blockToDuplicate.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Find parent and insert after original
    const insertDuplicate = (blocks: Block[]): Block[] => {
      return blocks.reduce((acc, block) => {
        if (block.id === id) {
          return [...acc, block, duplicatedBlock];
        }
        if (block.children) {
          return [...acc, { ...block, children: insertDuplicate(block.children) }];
        }
        return [...acc, block];
      }, [] as Block[]);
    };

    const newBlocks = insertDuplicate(blocks);
    setBlocks(newBlocks);
    addToHistory(newBlocks);
    setSelectedBlockId(duplicatedBlock.id);
  };

  // Render block
  const renderBlock = (block: Block, depth = 0) => {
    const isSelected = selectedBlockId === block.id;
    const blockStyle = {
      ...block.style,
      position: 'relative' as const,
      cursor: 'pointer',
      outline: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
      outlineOffset: isSelected ? '2px' : '0',
      margin: '5px 0'
    };

    const handleBlockClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedBlockId(block.id);
    };

    const renderContent = () => {
      switch (block.type) {
        case 'container':
          return (
            <div style={blockStyle} onClick={handleBlockClick}>
              {block.children?.map(child => renderBlock(child, depth + 1))}
              {(!block.children || block.children.length === 0) && (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#94a3b8',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '6px'
                }}>
                  Drop blocks here
                </div>
              )}
            </div>
          );
        
        case 'heading':
          const headingLevel = block.props?.level || 1;
          const Tag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
          return (
            <Tag 
              style={blockStyle} 
              onClick={handleBlockClick}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        
        case 'text':
          if (block.props?.type === 'input') {
            return (
              <input
                style={blockStyle}
                placeholder={block.content}
                onClick={handleBlockClick}
                readOnly
              />
            );
          }
          return (
            <p 
              style={blockStyle} 
              onClick={handleBlockClick}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        
        case 'button':
          return (
            <button 
              style={blockStyle} 
              onClick={handleBlockClick}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        
        case 'image':
          return (
            <img
              src={block.props?.src}
              alt=""
              style={blockStyle}
              onClick={handleBlockClick}
            />
          );
        
        case 'columns':
          return (
            <div 
              style={{ 
                ...blockStyle, 
                gridTemplateColumns: `repeat(${block.props?.columns || 2}, 1fr)`
              }} 
              onClick={handleBlockClick}
            >
              {block.children?.map(child => renderBlock(child, depth + 1))}
            </div>
          );
        
        case 'divider':
          return <hr style={blockStyle} onClick={handleBlockClick} />;
        
        case 'spacer':
          return <div style={blockStyle} onClick={handleBlockClick} />;
        
        case 'icon':
          return (
            <div 
              style={blockStyle} 
              onClick={handleBlockClick}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        
        default:
          return (
            <div 
              style={blockStyle} 
              onClick={handleBlockClick}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
      }
    };

    return (
      <div
        key={block.id}
        draggable
        onDragStart={(e) => handleDragStart(e, block)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, block.id)}
        style={{
          position: 'relative',
          minHeight: '20px'
        }}
      >
        {renderContent()}
        
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 100
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
              }}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBlock(block.id);
              }}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const selectedBlock = selectedBlockId ? findBlockById(blocks, selectedBlockId) : null;

  // Get viewport dimensions
  const getViewportDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: 'auto' };
    }
  };

  const viewport = getViewportDimensions();

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Left Sidebar - Templates & Blocks */}
      <div style={{ 
        width: '320px', 
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>
            🎨 Page Builder
          </h2>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                opacity: historyIndex > 0 ? 1 : 0.5
              }}
            >
              ↩ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed',
                opacity: historyIndex < history.length - 1 ? 1 : 0.5
              }}
            >
              ↪ Redo
            </button>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '20px'
        }}>
          {/* Templates Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 12px 0'
            }}>
              📋 Templates
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      {template.name}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      margin: 0
                    }}>
                      {template.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocks Library */}
          {blockLibrary.map(category => (
            <div key={category.category} style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 12px 0'
              }}>
                {category.category}
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {category.blocks.map(block => (
                  <div
                    key={block.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('block-type', block.type);
                      setIsDragging(true);
                    }}
                    onDragEnd={() => setIsDragging(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'grab',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '20px' }}>{block.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#1e293b',
                        margin: '0 0 2px 0'
                      }}>
                        {block.name}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        margin: 0
                      }}>
                        {block.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Canvas */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <div style={{ 
          padding: '16px 20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['desktop', 'tablet', 'mobile'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: viewMode === mode ? '#3b82f6' : '#f1f5f9',
                    color: viewMode === mode ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {mode === 'desktop' && '💻'}
                  {mode === 'tablet' && '📱'}
                  {mode === 'mobile' && '📲'}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#475569' }}>Show Grid</span>
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setBlocks([])}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => console.log('Export blocks:', blocks)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Export
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: showGrid ? 
              'repeating-linear-gradient(0deg, transparent, transparent 19px, #f1f5f9 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #f1f5f9 20px)' 
              : '#f8fafc'
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, undefined, blocks.length)}
        >
          <div 
            style={{ 
              width: viewport.width,
              minHeight: viewport.height,
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Drop Zone Overlay */}
            {isDragging && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '2px dashed #3b82f6',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Drop blocks here
                </div>
              </div>
            )}

            {/* Render Blocks */}
            <div style={{ padding: '20px' }}>
              {blocks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}>
                  <div style={{ 
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    🎨
                  </div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#475569',
                    margin: '0 0 8px 0'
                  }}>
                    Start Building Your Page
                  </h3>
                  <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>
                    Drag blocks from the sidebar or choose a template to begin
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {templates.slice(0, 2).map(template => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Use {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {blocks.map(block => renderBlock(block))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Inspector */}
      <div style={{ 
        width: '320px', 
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1e293b',
            margin: 0
          }}>
            ⚙️ Inspector
          </h2>
          {selectedBlock && (
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#f1f5f9',
              padding: '4px 8px',
              borderRadius: '12px',
              color: '#64748b'
            }}>
              {selectedBlock.type}
            </span>
          )}
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '20px'
        }}>
          {selectedBlock ? (
            <div>
              {/* Content Editing */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#475569',
                  margin: '0 0 12px 0'
                }}>
                  Content
                </h3>
                <textarea
                  value={selectedBlock.content}
                  onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Style Controls */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#475569',
                  margin: '0 0 12px 0'
                }}>
                  Style
                </h3>
                
                {/* Background Color */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    color: '#64748b',
                    marginBottom: '6px'
                  }}>
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={selectedBlock.style.backgroundColor || '#ffffff'}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      style: { ...selectedBlock.style, backgroundColor: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Padding */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    color: '#64748b',
                    marginBottom: '6px'
                  }}>
                    Padding
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.style.padding || ''}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      style: { ...selectedBlock.style, padding: e.target.value }
                    })}
                    placeholder="e.g., 20px"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Text Color */}
                {(selectedBlock.type === 'text' || selectedBlock.type === 'heading' || selectedBlock.type === 'button') && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedBlock.style.color || '#000000'}
                      onChange={(e) => updateBlock(selectedBlock.id, {
                        style: { ...selectedBlock.style, color: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}

                {/* Font Size */}
                {(selectedBlock.type === 'text' || selectedBlock.type === 'heading') && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      Font Size
                    </label>
                    <select
                      value={selectedBlock.style.fontSize || '16px'}
                      onChange={(e) => updateBlock(selectedBlock.id, {
                        style: { ...selectedBlock.style, fontSize: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text Align */}
                {(selectedBlock.type === 'text' || selectedBlock.type === 'heading') && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      Text Align
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['left', 'center', 'right'].map(align => (
                        <button
                          key={align}
                          onClick={() => updateBlock(selectedBlock.id, {
                            style: { ...selectedBlock.style, textAlign: align }
                          })}
                          style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: selectedBlock.style.textAlign === align ? '#3b82f6' : '#f1f5f9',
                            color: selectedBlock.style.textAlign === align ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Border Radius */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    color: '#64748b',
                    marginBottom: '6px'
                  }}>
                    Border Radius
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={parseInt(selectedBlock.style.borderRadius || '0')}
                    onChange={(e) => updateBlock(selectedBlock.id, {
                      style: { ...selectedBlock.style, borderRadius: `${e.target.value}px` }
                    })}
                    style={{
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#475569',
                  margin: '0 0 12px 0'
                }}>
                  Advanced
                </h3>
                
                {/* Custom CSS */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    color: '#64748b',
                    marginBottom: '6px'
                  }}>
                    Custom CSS
                  </label>
                  <textarea
                    placeholder="Add custom CSS..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Additional Props */}
                {selectedBlock.type === 'columns' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      Number of Columns
                    </label>
                    <select
                      value={selectedBlock.props?.columns || 2}
                      onChange={(e) => updateBlock(selectedBlock.id, {
                        props: { ...selectedBlock.props, columns: parseInt(e.target.value) },
                        style: { ...selectedBlock.style, gridTemplateColumns: `repeat(${e.target.value}, 1fr)` }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} Column{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedBlock.type === 'heading' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      color: '#64748b',
                      marginBottom: '6px'
                    }}>
                      Heading Level
                    </label>
                    <select
                      value={selectedBlock.props?.level || 1}
                      onChange={(e) => updateBlock(selectedBlock.id, {
                        props: { ...selectedBlock.props, level: parseInt(e.target.value) }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(level => (
                        <option key={level} value={level}>H{level}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div style={{ 
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px'
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#dc2626',
                  margin: '0 0 12px 0'
                }}>
                  Danger Zone
                </h3>
                <button
                  onClick={() => deleteBlock(selectedBlock.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Delete Block
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                ⚙️
              </div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#475569',
                margin: '0 0 8px 0'
              }}>
                Select a Block
              </h3>
              <p style={{ fontSize: '14px' }}>
                Click on any block in the canvas to edit its properties and styles.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b',
            textAlign: 'center'
          }}>
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} • {history.length} history states
          </div>
        </div>
      </div>

      {/* Drag Preview */}
      {isDragging && dragBlock && (
        <div style={{
          position: 'fixed',
          top: dropPosition?.y || 0,
          left: dropPosition?.x || 0,
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0.8,
          transform: 'translate(10px, 10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>
              {blockLibrary.flatMap(cat => cat.blocks).find(b => b.type === dragBlock.type)?.icon || '📦'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              {dragBlock.type.charAt(0).toUpperCase() + dragBlock.type.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;