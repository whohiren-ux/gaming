import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} role="navigation" aria-label="Pagination">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-white/40">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

interface CursorPaginationProps {
  hasMore: boolean;
  onNext: () => void;
  onPrevious?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function CursorPagination({ hasMore, onNext, onPrevious, className, isLoading }: CursorPaginationProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {onPrevious && (
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={isLoading}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasMore || isLoading}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
