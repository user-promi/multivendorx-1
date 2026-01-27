import React, { useState } from 'react';
import './pagination.scss';

interface PagePickerProps {
	currentPage: number;
	pageCount: number;
	setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto') => void;
}

const PagePicker: React.FC<PagePickerProps> = ({ currentPage, pageCount, setCurrentPage }) => {
	
	const [inputValue, setInputValue] = useState<number>(currentPage);
	const previousPage = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1, 'previous');
		}
	};

	const nextPage = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (currentPage < pageCount) {
			setCurrentPage(currentPage + 1, 'next');
		}
	};

	if (pageCount <= 1) return null;

	const isPreviousActive = currentPage > 1;
	const isNextActive = currentPage < pageCount;

	const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(Number(event.currentTarget.value));
	};

	const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		const newPage = Number(event.target.value);

		if (newPage !== currentPage && Number.isFinite(newPage) && newPage > 0 && newPage <= pageCount) {
			setCurrentPage(newPage, 'goto');
		} else {
			// Reset to currentPage if invalid
			setInputValue(currentPage);
		}
	};

	const selectInputValue = (event: React.MouseEvent<HTMLInputElement>) => {
		event.currentTarget.select();
	};

	const isError = currentPage < 1 || currentPage > pageCount;

	return (
		<div className="pagination-page-picker pagination-number-wrapper">

			<div className="pagination-arrow">
				<button
					className={`pagination-link ${isPreviousActive ? 'is-active' : ''}`}
					disabled={!isPreviousActive}
					onClick={previousPage}
					aria-label="Previous Page"
				>
					<i className="adminfont-previous"></i>
				</button>

				<button
					className={`pagination-link ${isNextActive ? 'is-active' : ''}`}
					disabled={!isNextActive}
					onClick={nextPage}
					aria-label="Next Page"
				>
					<i className="adminfont-next"></i>
				</button>
			</div>
			<label className="show-section">
				Go to page
				<input
					type="number"
					className={`pagination-page-picker-input${isError ? ' has-error' : ''}`}
					aria-invalid={isError}
					onClick={selectInputValue}
					onChange={onInputChange}
					onBlur={onInputBlur}
					value={inputValue}
					min={1}
					max={pageCount}
				/>
			</label>
		</div>
	);
};

export default PagePicker;
