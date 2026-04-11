import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showItemsCount?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

/**
 * Composant Pagination réutilisable et accessible
 * Conforme WCAG 2.1 avec navigation clavier
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
  showFirstLast = true,
  showItemsCount = true,
  maxVisiblePages = 7,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Calcul des pages visibles
  const getVisiblePages = (): number[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisiblePages + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  const handleKeyDown = (e: React.KeyboardEvent, page: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items count */}
      {showItemsCount && totalItems !== undefined && (
        <div className="text-sm text-gray-600">
          Affichage{' '}
          <span className="font-medium">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>
          {' - '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>
          {' sur '}
          <span className="font-medium">{totalItems}</span>
          {' résultats'}
        </div>
      )}

      {/* Pagination buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => onPageChange(1)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            disabled={currentPage === 1}
            aria-label="Première page"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          onKeyDown={(e) => handleKeyDown(e, Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                aria-label="Page 1"
                className="min-w-[40px] h-10 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              onKeyDown={(e) => handleKeyDown(e, page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`min-w-[40px] h-10 px-3 rounded-lg border transition ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                onKeyDown={(e) => handleKeyDown(e, totalPages)}
                aria-label={`Page ${totalPages}`}
                className="min-w-[40px] h-10 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          onKeyDown={(e) => handleKeyDown(e, Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            onKeyDown={(e) => handleKeyDown(e, totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Dernière page"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
};

/**
 * Hook personnalisé pour gérer la pagination
 */
export const usePagination = (totalItems: number, itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  // Reset to page 1 when totalItems changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  return {
    currentPage,
    totalPages,
    offset,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
