import React from 'react';

type ColumnProps = {
  grid?: number; // 1–12
  className?: string;
  children: React.ReactNode;
  row?: boolean;
};

const Column: React.FC<ColumnProps> = ({
  grid = 12,
  className = '',
  children,
  row = false,
}) => {
  const columnClass = `card-wrapper column-${grid}`;
  const columnClasses = `${columnClass} ${className}`.trim();

  return <div className={`${row ? 'row' : ''} ${columnClasses }`}>{children}</div>;
};

export default Column;
