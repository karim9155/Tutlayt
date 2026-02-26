"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  basePath: string
  params?: Record<string, string | undefined>
}

export function PaginationControls({ currentPage, totalPages, basePath, params = {} }: PaginationControlsProps) {
  const buildHref = (page: number) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value)
    })
    searchParams.set("page", String(page))
    return `${basePath}?${searchParams.toString()}`
  }
  if (totalPages <= 1) return null

  const pages: (number | "ellipsis")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("ellipsis")
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? buildHref(currentPage - 1) : undefined}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href={buildHref(p)} isActive={p === currentPage}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? buildHref(currentPage + 1) : undefined}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
