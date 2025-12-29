type FormGroupProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

const FormGroup: React.FC<FormGroupProps> = ({ label, htmlFor, children, className }) => {
  return (
    <div className={`form-group ${className ? className : ''}`}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
    </div>
  );
};

export default FormGroup;