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
  pageSize?: number;
  navigationPath?: string;
  onRowClick?: (rowData: any) => void;
  deleteRow?: (id: any) => void; // New prop for delete function
}

export default function BasicTableTwo({
  columns,
  rowData,
  pageSize = 5,
  navigationPath = '#',
  onRowClick,
  deleteRow, // New prop
}: BasicTableTwoProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
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
  const navigate = useNavigate();

  // Update local data when props change
  useEffect(() => {
    setLocalRowData(rowData);
  }, [rowData]);

  const totalPages = Math.max(1, Math.ceil(localRowData.length / pageSize));

  const displayData = localRowData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowClick = (rowData: any) => {
    navigate(navigationPath, { state: { rowData } });
  };

  const handleDeleteClick = (e: React.MouseEvent, row: any, rowIndex: number) => {
    e.stopPropagation(); // Prevent row click
    setDeletePrompt({
      isOpen: true,
      rowData: row,
      rowIndex: rowIndex,
    });
  };

  const handleConfirm = async () => {
    if (deleteRow) {
      // Optimistically update the UI first
      const updatedData = localRowData.filter(row => row.id !== deletePrompt.rowData.id);
      setLocalRowData(updatedData);

      // Adjust current page if necessary
      const newTotalPages = Math.max(1, Math.ceil(updatedData.length / pageSize));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      try {
        // Call the deleteRow function passed from props
        await deleteRow(deletePrompt.rowData.id);
      } catch (error) {
        // If delete fails, revert the optimistic update
        console.error('Delete failed:', error);
        setLocalRowData(rowData);
      }
    } else {
      // Fallback - log to console if no deleteRow function provided
      console.log('Delete confirmed for:', deletePrompt.rowData);
    }
    setDeletePrompt({ isOpen: false, rowData: null, rowIndex: -1 });
  };

  const handleCancel = () => {
    setDeletePrompt({ isOpen: false, rowData: null, rowIndex: -1 });
  };

  console.log(onRowClick)

  const renderPagination = () => {
    const pages = [];

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${currentPage === 1
          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
      >
        Previous
      </button>
    );

    if (currentPage > 2) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          1
        </button>
      );
    }

    if (currentPage > 3) {
      pages.push(<span key="ellipsis1" className="px-3 py-1 mx-1">...</span>);
    }

    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${i === currentPage
            ? "bg-blue-500 text-white dark:bg-blue-600"
            : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      pages.push(<span key="ellipsis2" className="px-3 py-1 mx-1">...</span>);
    }

    if (currentPage < totalPages - 1 && totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages
          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
      >
        Next
      </button>
    );

    return pages;
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
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell className="px-5 py-3 text-sm">
                    <button
                      onClick={(e) => handleDeleteClick(e, row, rowIndex)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        {renderPagination()}
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