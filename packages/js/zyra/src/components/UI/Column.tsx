import React from 'react';

type ColumnProps = {
  grid?: number; // 1–12
  className?: string;
  children: React.ReactNode;
};

const Column: React.FC<ColumnProps> = ({
  grid = 12,
  className = '',
  children,
}) => {
  const columnClass = `card-wrapper column-${grid}`;
  const columnClasses = `${columnClass} ${className}`.trim();

  return <div className={columnClasses}>{children}</div>;
};

export default Column;
