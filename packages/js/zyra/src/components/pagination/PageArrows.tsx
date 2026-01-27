import React from 'react';
import './pagination.scss';

interface PageArrowsProps {
	currentPage: number;
	pageCount: number;
	showPageArrowsLabel?: boolean;
	setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto') => void;
}

const PageArrows: React.FC<PageArrowsProps> = ({
	currentPage,
	pageCount,
	showPageArrowsLabel = true,
	setCurrentPage,
}) => {
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

	return (
		<div className="pagination-number-wrapper">
			{showPageArrowsLabel && (
				<span
					className="show-section"
					role="status"
					aria-live="polite"
				>
					Showing {currentPage} to {pageCount} of 12 entries.
				</span>
			)}

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
		</div>
	);
};

export default PageArrows;
