import React, { useState } from 'react';

type CardProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  iconName?: string; // optional action icon
  onIconClick?: () => void; // optional icon click handler
  buttonLabel?: string;
  onButtonClick?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  children: React.ReactNode;
  grid?: number;
  toggle?: boolean; // if true, body can be collapsed
};

const Card: React.FC<CardProps> = ({
  title,
  desc,
  iconName,
  onIconClick,
  buttonLabel,
  onButtonClick,
  action,
  transparent = false,
  children,
  grid = 12,
  toggle = false,
}) => {
  const columnClass = `column-${grid}`;
  const [bodyVisible, setBodyVisible] = useState(true);

  // Handle icon click for toggling body
  const handleToggleClick = () => {
    if (toggle) {
      setBodyVisible(!bodyVisible);
    }
    if (onIconClick) onIconClick();
  };

  // Handle button click
  const handleButtonClick = () => {
    if (toggle) {
      setBodyVisible(!bodyVisible);
    }
    if (onButtonClick) onButtonClick();
  };

  return (
    <div className={`card-content ${columnClass} ${transparent ? 'transparent' : ''}`}>
      {(title || iconName || buttonLabel || action) && (
        <div className="card-header">
          <div className="left">
            {title && <div className="title">{title}</div>}
            {desc && <div className="des">{desc}</div>}
          </div>
          <div className="right">
            {action}
            {iconName && !action && (
              <i
                className={iconName}
                onClick={handleToggleClick}
                style={{ cursor: 'pointer', marginRight: buttonLabel ? '0.5rem' : 0 }}
              ></i>
            )}
            {buttonLabel && !action && (
              <button className="admin-btn btn-purple" onClick={handleButtonClick}>
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      )}
      {bodyVisible && <div className="card-body">{children}</div>}
    </div>
  );
};

export default Card;
