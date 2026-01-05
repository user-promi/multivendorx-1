type FormGroupProps = {
	label?: React.ReactNode;
	htmlFor?: string;
	children: React.ReactNode;
	className?: string;
	cols?: 1 | 2 | 3 | 4;
	row?: boolean;
};

const FormGroup: React.FC<FormGroupProps> = ({
	label,
	htmlFor,
	children,
	className = '',
	cols = 1,
	row = false,
}) => {
	return (
		<div
			className={`form-group ${row ? "row" : ""} ${className}`}
			data-cols={cols}
		>
			{label && <label htmlFor={htmlFor}>{label}</label>}
			{children}
		</div>
	);
};

export default FormGroup;
