type CardProps = {
  title?: React.ReactNode;
  action?: React.ReactNode;
  transparent?: boolean;
  children: React.ReactNode;
  width?: number;
};

const Card: React.FC<CardProps> = ({
  title,
  action,
  transparent,
  children,
  width,
}) => {
    const columnClass = `column-${width ?? 12}`;
  return (
    <div className={`card-content ${columnClass} ${transparent ? 'transparent' : ''}`} >
      {(title || action) && (
        <div className="card-header">
          <div className="left">
            {title && <div className="title">{title}</div>}
          </div>

          {action && <div className="right">{action}</div>}
        </div>
      )}

      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;