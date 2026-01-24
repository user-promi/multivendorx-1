import React from 'react';
import './table.scss';
import { RealtimeFilterConfig } from './types';

type Props = {
	filters: RealtimeFilterConfig[];
	value: Record<string, string | string[]>;
	onChange: (value: Record<string, string | string[]>) => void;
};

const RealtimeFilter: React.FC<Props> = ({
	filters,
	value,
	onChange,
}) => {
	const update = (
		key: string,
		val?: string | string[]
	) => {
		const next = { ...value };

		if (
			val === undefined ||
			(Array.isArray(val) && val.length === 0)
		) {
			delete next[key];
		} else {
			next[key] = val;
		}

		onChange(next);
	};

	return (
		<div className="realtime-filter">
			{filters.map((f) => (
				<div
					key={f.key}
					className="realtime-filter__item"
				>
					<label>{f.label}</label>

					<select
						multiple={f.multiple}
						value={
							f.multiple
								? (value[f.key] as string[]) || []
								: (value[f.key] as string) || ''
						}
						onChange={(e) => {
							if (f.multiple) {
								update(
									f.key,
									Array.from(
										e.target.selectedOptions
									).map((o) => o.value)
								);
							} else {
								update(
									f.key,
									e.target.value || undefined
								);
							}
						}}
					>
						{!f.multiple && (
							<option value="">All</option>
						)}

						{f.options.map((o) => (
							<option
								key={o.value}
								value={o.value}
							>
								{o.label}
							</option>
						))}
					</select>
				</div>
			))}
		</div>
	);
};

export default RealtimeFilter;
