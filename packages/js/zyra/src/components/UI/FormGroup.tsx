type FormGroupProps = {
	label?: React.ReactNode;
	htmlFor?: string;
	children: React.ReactNode;
	className?: string;
	cols?: 1 | 2 | 3 | 4;
};

const FormGroup: React.FC<FormGroupProps> = ({
	label,
	htmlFor,
	children,
	className = '',
	cols = 1,
}) => {
	return (
		<div
			className={`form-group ${className}`}
			data-cols={cols}
		>
			{label && <label htmlFor={htmlFor}>{label}</label>}
			{children}
		</div>
	);
};

export default FormGroup;
