import React, { useState } from 'react';
import "../../styles/web/UI/Card.scss";

export type CardProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  iconName?: string;
  onIconClick?: () => void;
  buttonLabel?: string;
  onButtonClick?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  toggle?: boolean;
  badges?: {
    text: string;
    color?: string;
  }[];
  children?: React.ReactNode;
};

const Card = ({
  title,
  desc,
  iconName,
  onIconClick,
  buttonLabel,
  onButtonClick,
  action,
  transparent = false,
  toggle = false,
  badges = [],
  children,
}: CardProps) => {
  const [bodyVisible, setBodyVisible] = useState(true);

  return (
    <div className={`card-content ${transparent ? 'transparent' : ''}`}>
      {(title || iconName || buttonLabel || action) && (
        <div className="card-header">
          <div className="left">
            {title && (
              <div className="title">
                {title}
                {badges.map((b, i) => (
                  <span key={i} className={`admin-badge ${b.color ?? ''}`}>
                    {b.text}
                  </span>
                ))}
              </div>
            )}
            {desc && <div className="des">{desc}</div>}
          </div>

          <div className="right">
            {action}

            {iconName && !action && (
              <i
                className={iconName}
                onClick={() => {
                  if (toggle) setBodyVisible(!bodyVisible);
                  onIconClick?.();
                }}
              />
            )}

            {buttonLabel && !action && (
              <button className="admin-btn btn-purple" onClick={onButtonClick}>
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {bodyVisible && children && (
        <div className="card-body">{children}</div>
      )}
    </div>
  );
};

export default Card;
