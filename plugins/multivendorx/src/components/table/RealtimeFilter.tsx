import React from 'react';
import Select, { MultiValue, SingleValue } from 'react-select';
import { RealtimeFilterConfig } from './types';
import { MultiCalendarInput } from 'zyra';

interface RealtimeFiltersProps {
	filters: RealtimeFilterConfig[];
	query: Record<string, any>;
	onFilterChange: (key: string, value: any) => void;
}

const RealtimeFilters: React.FC<RealtimeFiltersProps> = ({
	filters,
	query,
	onFilterChange,
}) => {
	if (!filters || filters.length === 0) return null;

	return (
		<div className="realtime-filters">
			{filters.map((filter) => {
				const value = query[filter.key];

				// Date filter
				if (filter.type === 'date') {
					return (
						<div key={filter.key} className="filter-item">
							<label>{filter.label}</label>
							<MultiCalendarInput
								value={value as { startDate: Date; endDate: Date } | undefined}
								onChange={(range) => onFilterChange(filter.key, range)}
								showLabel
							/>
						</div>
					);
				}

				// React select options
				const options = filter.options?.map((opt) => ({ label: opt.label, value: opt.value })) || [];

				// Single select
				if (!filter.multiple) {
					const selectedOption = options.find((o) => o.value === value) || null;
					return (
						<div key={filter.key} className="filter-item">
							<label>{filter.label}</label>
							<Select
								options={options}
								value={selectedOption}
								onChange={(option) => onFilterChange(filter.key, option?.value || '')}
								isClearable
								placeholder={`Select ${filter.label}`}
							/>
						</div>
					);
				}

				// Multi-select
				const selectedOptions = options.filter((o) =>
					Array.isArray(value) ? value.includes(o.value) : false
				);

				return (
					<div key={filter.key} className="filter-item">
						<label>{filter.label}</label>
						<Select
							options={options}
							value={selectedOptions}
							onChange={(option) => onFilterChange(filter.key, option.map((o) => o.value))}
							isMulti
							placeholder={`Select ${filter.label}`}
						/>
					</div>
				);
			})}

		</div>
	);
};

export default RealtimeFilters;
