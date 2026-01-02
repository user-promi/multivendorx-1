type ContainerProps = {
  column?: boolean;
  children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = ({
  column,
  children,
}) => {
  return (
    <div className={`container-wrapper ${column ? 'column' : ''}`}>
      {children}
    </div>
  );
};

export default Container;
