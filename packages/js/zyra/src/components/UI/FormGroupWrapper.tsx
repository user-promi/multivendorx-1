type FormGroupWrapperProps = {
  children: React.ReactNode;
  className?: string; // optional additional classes
};

const FormGroupWrapper: React.FC<FormGroupWrapperProps> = ({ children, className }) => {
  return (
    <div className={`form-group-wrapper ${className ? className : ''}`}>
      {children}
    </div>
  );
};

export default FormGroupWrapper;
