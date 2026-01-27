import React, { useState, useEffect } from 'react';
import './pagination.scss';

interface PagePickerProps {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number, action?: 'previous' | 'next' | 'goto' | 'first' | 'last') => void;
  maxPageButtons?: number;
}

const PagePicker: React.FC<PagePickerProps> = ({
  currentPage,
  pageCount,
  setCurrentPage,
  maxPageButtons = 5, // default to 5 buttons
}) => {
  const [inputValue, setInputValue] = useState<number>(currentPage);

  useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  const goToPage = (page: number, action?: 'previous' | 'next' | 'goto' | 'first' | 'last') => {
    if (page < 1) page = 1;
    if (page > pageCount) page = pageCount;
    setCurrentPage(page, action);
  };

  const previousPage = () => goToPage(currentPage - 1, 'previous');
  const nextPage = () => goToPage(currentPage + 1, 'next');
  const firstPage = () => goToPage(1, 'first');
  const lastPage = () => goToPage(pageCount, 'last');

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newPage = Number(e.target.value);
    if (Number.isFinite(newPage) && newPage >= 1 && newPage <= pageCount) {
      goToPage(newPage, 'goto');
    } else {
      setInputValue(currentPage); // Reset if invalid
    }
  };

  const selectInputValue = (e: React.MouseEvent<HTMLInputElement>) => e.currentTarget.select();

  // Determine visible page numbers
  const getVisiblePages = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let end = start + maxPageButtons - 1;

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, end - maxPageButtons + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (pageCount <= 1) return null;

  const pages = getVisiblePages();

  return (
    <div className="pagination-page-picker pagination-number-wrapper">
      <div className="pagination-arrow">
        <button
          className={`pagination-link ${currentPage > 1 ? 'is-active' : ''}`}
          disabled={currentPage <= 1}
          onClick={firstPage}
          aria-label="First Page"
        >
          <i className="adminfont-first"></i>
        </button>

        <button
          className={`pagination-link ${currentPage > 1 ? 'is-active' : ''}`}
          disabled={currentPage <= 1}
          onClick={previousPage}
          aria-label="Previous Page"
        >
          <i className="adminfont-previous"></i>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-link ${currentPage === page ? 'active' : ''}`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className={`pagination-link ${currentPage < pageCount ? 'is-active' : ''}`}
          disabled={currentPage >= pageCount}
          onClick={nextPage}
          aria-label="Next Page"
        >
          <i className="adminfont-next"></i>
        </button>

        <button
          className={`pagination-link ${currentPage < pageCount ? 'is-active' : ''}`}
          disabled={currentPage >= pageCount}
          onClick={lastPage}
          aria-label="Last Page"
        >
          <i className="adminfont-last"></i>
        </button>
      </div>

      <label className="show-section">
        Go to page
        <input
          type="number"
          min={1}
          max={pageCount}
          value={inputValue}
          onClick={selectInputValue}
          onChange={onInputChange}
          onBlur={onInputBlur}
          className={`pagination-page-picker-input`}
        />
      </label>
    </div>
  );
};

export default PagePicker;
