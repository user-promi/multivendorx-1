import React, { useState } from 'react';

type Badge = {
  text: string;
  color?: string;
};

type CardProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  iconName?: string;
  onIconClick?: () => void;
  buttonLabel?: string;
  onButtonClick?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  children: React.ReactNode;
  toggle?: boolean;
  badges?: Badge[];
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
  toggle = false,
  badges = [],
}) => {
  const [bodyVisible, setBodyVisible] = useState(true);

  const handleToggleClick = () => {
    if (toggle) {
      setBodyVisible(!bodyVisible);
    }
    if (onIconClick) onIconClick();
  };

  const handleButtonClick = () => {
    if (toggle) {
      setBodyVisible(!bodyVisible);
    }
    if (onButtonClick) onButtonClick();
  };

  return (
    <div className={`card-content ${transparent ? 'transparent' : ''}`}>
      {(title || iconName || buttonLabel || action) && (
        <div className="card-header">
          <div className="left">
            {title && (
              <div className="title">
                {title}
                {badges.length > 0 && (
                  <>
                    {badges.map((badge, i) => (
                      <span className={`admin-badge ${badge.color || ''}`}>{badge.text}</span>
                    ))}
                  </>
                )}
              </div>
            )}
            {desc && <div className="des">{desc}</div>}
          </div>

          <div className="right">
            {action}

            {iconName && !action && (
              <i
                className={iconName}
                onClick={handleToggleClick}
                style={{ cursor: 'pointer', marginRight: buttonLabel ? '0.5rem' : 0 }}
              />
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
