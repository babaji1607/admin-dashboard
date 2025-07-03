import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface BasicTableTwoProps {
  columns: Column[];
  rowData: any[];
  navigationPath?: string;
  onRowClick?: (rowData: any) => void;
  deleteRow?: (id: any) => void;
  // New props for infinite scrolling
  loadMoreData?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  // Old pagination props (optional for backward compatibility)
  pageSize?: number;
}

export default function BasicTableTwo({
  columns,
  rowData,
  navigationPath = '#',
  onRowClick,
  deleteRow,
  loadMoreData,
  hasMore = false,
  isLoading = false,
  // pageSize, // Keep for backward compatibility
}: BasicTableTwoProps) {
  const [localRowData, setLocalRowData] = useState(rowData);
  const [deletePrompt, setDeletePrompt] = useState<{
    isOpen: boolean;
    rowData: any;
    rowIndex: number;
  }>({
    isOpen: false,
    rowData: null,
    rowIndex: -1,
  });
  const [isThrottled, setIsThrottled] = useState(false);
  const navigate = useNavigate();

  // Determine if we're using infinite scroll or pagination
  const useInfiniteScroll = !!loadMoreData;

  // Update local data when props change
  useEffect(() => {
    setLocalRowData(rowData);
  }, [rowData]);

  // Throttled scroll handler for window scroll
  // const handleScroll = useCallback(() => {
  //   if (!loadMoreData || !hasMore || isLoading || isThrottled) return;

  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  //   const windowHeight = window.innerHeight;
  //   const documentHeight = document.documentElement.scrollHeight;
  //   const scrollThreshold = 200; // Load more when 200px from bottom

  //   if (documentHeight - scrollTop - windowHeight < scrollThreshold) {
  //     setIsThrottled(true);
  //     loadMoreData().finally(() => {
  //       // Reset throttle after a delay
  //       setTimeout(() => {
  //         setIsThrottled(false);
  //       }, 500);
  //     });
  //   }
  // }, [loadMoreData, hasMore, isLoading, isThrottled]);



  const handleRowClick = (rowData: any) => {
    if (onRowClick) {
      onRowClick(rowData);
    } else {
      navigate(navigationPath, { state: { rowData } });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, row: any, rowIndex: number) => {
    e.stopPropagation();
    setDeletePrompt({
      isOpen: true,
      rowData: row,
      rowIndex: rowIndex,
    });
  };

  const handleConfirm = async () => {
    if (deleteRow) {
      const updatedData = localRowData.filter(row => row.id !== deletePrompt.rowData.id);
      setLocalRowData(updatedData);

      try {
        await deleteRow(deletePrompt.rowData.id);
      } catch (error) {
        console.error('Delete failed:', error);
        setLocalRowData(rowData);
      }
    } else {
      console.log('Delete confirmed for:', deletePrompt.rowData);
    }
    setDeletePrompt({ isOpen: false, rowData: null, rowIndex: -1 });
  };

  const handleCancel = () => {
    setDeletePrompt({ isOpen: false, rowData: null, rowIndex: -1 });
  };

  // TrashIcon component
  const TrashIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading more...</span>
    </div>
  );

  // Add scroll event listener to window instead of container
  useEffect(() => {
    if (!useInfiniteScroll) return;

    const handleWindowScroll = () => {
      if (!loadMoreData || !hasMore || isLoading || isThrottled) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollThreshold = 200; // Load more when 200px from bottom

      if (documentHeight - scrollTop - windowHeight < scrollThreshold) {
        setIsThrottled(true);
        loadMoreData().finally(() => {
          setTimeout(() => {
            setIsThrottled(false);
          }, 500);
        });
      }
    };

    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [loadMoreData, hasMore, isLoading, isThrottled, useInfiniteScroll]);

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {column.header}
                  </TableCell>
                ))}
                {deleteRow && (
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {localRowData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                  {deleteRow && (
                    <TableCell className="px-5 py-3 text-sm">
                      <button
                        onClick={(e) => handleDeleteClick(e, row, rowIndex)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Loading indicator for infinite scroll */}
          {useInfiniteScroll && (isLoading || hasMore) && (
            <div className="p-4">
              {isLoading && <LoadingSpinner />}
              {!isLoading && hasMore && (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Scroll down to load more...
                </div>
              )}
            </div>
          )}

          {/* No more data message */}
          {useInfiniteScroll && !hasMore && localRowData.length > 0 && (
            <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/[0.05]">
              No more data to load
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Prompt */}
      {deletePrompt.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors duration-150"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}