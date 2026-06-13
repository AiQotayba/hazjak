"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { PaginationMeta } from "@hazjak/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

const DEFAULT_LIMIT = 10;
const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export interface TableColumn<T = object> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface TablePaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  apiEndpoint: string;
  enableActions?: boolean;
  actions?: {
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
  };
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  enableDelete?: boolean;
  enableEdit?: boolean;
  enableView?: boolean;
  skeletonRows?: number;
  deleteTitle?: string;
  deleteDescription?: (row: T) => string;
  onDeleteConfirm?: (row: T) => Promise<void>;
  showIdColumn?: boolean;
  limitOptions?: number[];
  toolbarExtra?: React.ReactNode;
}

function toTableMeta(meta?: PaginationMeta | TablePaginationMeta): TablePaginationMeta {
  if (!meta) {
    return { current_page: 1, last_page: 1, per_page: DEFAULT_LIMIT, total: 0 };
  }
  if ("current_page" in meta) {
    return meta;
  }
  return {
    current_page: meta.page,
    last_page: meta.totalPages || 1,
    per_page: meta.limit,
    total: meta.total,
  };
}

export function DataTable<T extends object>(props: DataTableProps<T>) {
  return (
    <React.Suspense
      fallback={
        <DataTableSkeleton columns={props.columns} skeletonRows={props.skeletonRows} />
      }
    >
      <DataTableInner {...props} />
    </React.Suspense>
  );
}

function DataTableSkeleton({
  columns,
  skeletonRows = 5,
}: {
  columns: Array<Pick<TableColumn<object>, "key" | "label">>;
  skeletonRows?: number;
}) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
              <TableHead className="w-32">
                <Skeleton className="h-4 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-6 w-full max-w-[200px]" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="h-8 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DataTableInner<T extends object>({
  columns,
  apiEndpoint,
  enableActions = true,
  actions,
  onAdd,
  addLabel = "إضافة",
  searchPlaceholder = "بحث...",
  emptyMessage = "لا توجد بيانات",
  enableDelete = true,
  enableEdit = true,
  enableView = true,
  skeletonRows = 5,
  deleteTitle = "تأكيد الحذف",
  deleteDescription,
  onDeleteConfirm,
  showIdColumn = false,
  limitOptions = [...LIMIT_OPTIONS],
  toolbarExtra,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams?.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams?.get("limit")) || DEFAULT_LIMIT);

  const [sortColumn, setSortColumn] = React.useState<string | null>(
    searchParams?.get("sort_field") || null
  );
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | null>(() => {
    const order = searchParams?.get("sort_order");
    return order === "asc" || order === "desc" ? order : null;
  });
  const [searchValue, setSearchValue] = React.useState(searchParams?.get("search") || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const queryKey = React.useMemo(() => {
    const params = Object.fromEntries(searchParams?.entries() || []);
    return ["table-data", apiEndpoint, params];
  }, [apiEndpoint, searchParams]);

  const { data: queryData, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = Object.fromEntries(searchParams?.entries() || []);
      const apiParams: Record<string, string | number> = {
        ...params,
        page,
        limit,
      };

      const response = await apiClient.get<T[]>(apiEndpoint, { params: apiParams });
      if (response.isError) throw new Error(response.message);

      return {
        data: (response.data ?? []) as T[],
        meta: toTableMeta(response.meta),
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = queryData?.data ?? [];
  const pagination = queryData?.meta ?? toTableMeta();

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSearch = React.useCallback(
    (value: string) => {
      setSearchValue(value);
      updateParams({ search: value || null, page: "1" });
    },
    [updateParams]
  );

  const handleSort = (columnKey: string) => {
    let newDirection: "asc" | "desc" | null = null;
    let newColumn: string | null = columnKey;

    if (sortColumn === columnKey) {
      if (sortDirection === null || sortDirection === "asc") {
        newDirection = sortDirection === null ? "asc" : "desc";
      } else {
        newDirection = null;
        newColumn = null;
      }
    } else {
      newDirection = "asc";
    }

    setSortColumn(newColumn);
    setSortDirection(newDirection);

    if (newDirection === null) {
      updateParams({ sort_field: null, sort_order: null });
    } else {
      updateParams({ sort_field: columnKey, sort_order: newDirection });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleLimitChange = (newLimit: string) => {
    updateParams({ limit: newLimit, page: "1" });
  };

  const handleDeleteClick = (row: T) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsDeleting(true);
      if (onDeleteConfirm) {
        await onDeleteConfirm(selectedRow);
      } else {
        const baseEndpoint = apiEndpoint.replace(/\?.*$/, "");
        const id = (selectedRow as { id: string }).id;
        const response = await apiClient.delete(`${baseEndpoint}/${id}`, {
          showSuccessToast: true,
        });
        if (response.isError) throw new Error(response.message);
      }
      queryClient.invalidateQueries({ queryKey: ["table-data", apiEndpoint] });
      setDeleteDialogOpen(false);
      setSelectedRow(null);
      toast.success("تم الحذف بنجاح");
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setIsDeleting(false);
    }
  };

  const allColumns: TableColumn<T>[] = React.useMemo(() => {
    if (!showIdColumn) return columns;
    const idColumn: TableColumn<T> = {
      key: "id",
      label: "#",
      sortable: true,
      width: "w-20",
      render: (value) => (
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[4rem] block">
          {String(value).slice(0, 8)}…
        </span>
      ),
    };
    return [idColumn, ...columns];
  }, [columns, showIdColumn]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pe-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute start-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => handleSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {toolbarExtra}
        </div>

        {onAdd && (
          <Button variant="brand" onClick={onAdd} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {allColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.width,
                    column.sortable && "cursor-pointer select-none"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <>
                        {sortDirection === "asc" && <ChevronUp className="h-4 w-4" />}
                        {sortDirection === "desc" && <ChevronDown className="h-4 w-4" />}
                      </>
                    )}
                  </div>
                </TableHead>
              ))}
              {enableActions && (
                <TableHead className="w-32">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {allColumns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-6 w-full max-w-[200px]" />
                    </TableCell>
                  ))}
                  {enableActions && (
                    <TableCell>
                      <Skeleton className="h-8 w-24" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length + (enableActions ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="h-8 w-8 text-muted-foreground/50" />
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: any) => (
                <TableRow key={String((row as { id: string }).id)}>
                  {allColumns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render((row as Record<string, unknown>)[column.key], row)
                        : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </TableCell>
                  ))}
                  {enableActions && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {enableView && actions?.onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => actions.onView?.(row)}
                            aria-label="عرض"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>   
                        )}
                        {enableEdit && actions?.onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => actions.onEdit?.(row)}
                            aria-label="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {enableDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(row)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              عرض {(pagination.current_page - 1) * pagination.per_page + 1} –{" "}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} من{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">عدد العرض:</span>
              <Select value={String(pagination.per_page)} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[72px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {pagination.last_page > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page <= 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                السابق
              </Button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => {
                  const current = pagination.current_page;
                  return (
                    p === 1 || p === pagination.last_page || Math.abs(p - current) <= 1
                  );
                })
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <Button
                      variant={p === pagination.current_page ? "brand" : "outline"}
                      size="sm"
                      className="min-w-9"
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteTitle}</DialogTitle>
            <DialogDescription>
              {selectedRow && deleteDescription
                ? deleteDescription(selectedRow)
                : "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
