// ImageGallery.tsx
import React, { useState, useRef } from 'react';

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  onImageSelect: (images: ImageItem[]) => void; // Changed to accept array
  multiple?: boolean;
  selectedImages?: ImageItem[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  onImageSelect,
  multiple = false,
  selectedImages = []
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [localSelected, setLocalSelected] = useState<ImageItem[]>(selectedImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock initial images - replace with actual API call
  const mockImages: ImageItem[] = [
    { id: '1', url: 'https://via.placeholder.com/300x200', alt: 'Placeholder 1' },
    { id: '2', url: 'https://via.placeholder.com/300x200/008000', alt: 'Placeholder 2' },
    { id: '3', url: 'https://via.placeholder.com/300x200/FF0000', alt: 'Placeholder 3' },
    { id: '4', url: 'https://via.placeholder.com/300x200/0000FF', alt: 'Placeholder 4' },
  ];

  React.useEffect(() => {
    setImages(mockImages);
  }, []);

  React.useEffect(() => {
    setLocalSelected(selectedImages);
  }, [selectedImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    // Simulate upload process
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageItem = {
          id: `uploaded-${Date.now()}-${index}`,
          url: e.target?.result as string,
          alt: file.name,
        };
        setImages(prev => [newImage, ...prev]);
      };
      reader.readAsDataURL(file);
    });

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (image: ImageItem) => {
    let newSelected: ImageItem[];
    
    if (multiple) {
      const isAlreadySelected = localSelected.some(selected => selected.id === image.id);
      if (isAlreadySelected) {
        newSelected = localSelected.filter(selected => selected.id !== image.id);
      } else {
        newSelected = [...localSelected, image];
      }
    } else {
      newSelected = [image];
    }
    
    setLocalSelected(newSelected);
  };

  const isSelected = (image: ImageItem) => {
    return localSelected.some(selected => selected.id === image.id);
  };

  const handleConfirmSelection = () => {
    onImageSelect(localSelected);
  };

  return (
    <div className="image-gallery-wrapper">
      <div className="gallery-header">
        <h3>Media Library</h3>
        <div className="gallery-actions">
          <button
            className="admin-btn btn-purple"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="image-grid">
        {images.map((image) => (
          <div
            key={image.id}
            className={`image-item ${isSelected(image) ? 'selected' : ''}`}
            onClick={() => handleImageClick(image)}
          >
            <div className="image-container">
              <img src={image.url} alt={image.alt} />
              <div className="image-overlay">
                <i className="admin-font adminlib-check"></i>
              </div>
            </div>
            <div className="image-meta">
              <span className="image-name">{image.alt}</span>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="empty-state">
          <i className="admin-font adminlib-image"></i>
          <p>No images found</p>
          <button
            className="admin-btn btn-purple"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Your First Image
          </button>
        </div>
      )}

      <div className="gallery-footer">
        <div className="selection-info">
          {localSelected.length} image{localSelected.length !== 1 ? 's' : ''} selected
        </div>
        <div className="footer-actions">
          <button className="admin-btn default-btn" onClick={() => onImageSelect([])}>
            Cancel
          </button>
          <button className="admin-btn btn-purple" onClick={handleConfirmSelection}>
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;