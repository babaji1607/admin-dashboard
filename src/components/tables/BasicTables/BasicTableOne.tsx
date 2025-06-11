import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import NotificationForm from "./NotificationForm";
import { sendMassNotification, sendSingleNotification } from "../../../api/Notifications";

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface DynamicTableProps {
  columns: Column[];  // Columns are required, not optional
  rowData: any[];     // Array of objects with keys matching column keys
  pageSize?: number;
  onRowClick?: (row: any) => void; // Made onRowClick optional with proper typing
  notificationChannel: string; // Made onRowClick optional with proper typing
}

export default function DynamicTableWithNotification({
  columns,
  pageSize = 5,
  rowData,
  notificationChannel,
  onRowClick = () => { }
}: DynamicTableProps) {
  // Keep only essential state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Notification form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isNotifyAllFormOpen, setIsNotifyAllFormOpen] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>("");
  const [notificationStatus, setNotificationStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({
    show: false,
    success: false,
    message: "",
  });

  // Calculate total pages based on rowData length
  const totalPages = Math.max(1, Math.ceil(rowData.length / pageSize));

  // Empty default columns - will use provided columns instead

  // Add notification action column
  const notificationColumn: Column = {
    key: "action",
    header: "Notify",
    render: (row) => (
      <button
        onClick={(e) => {
          // Stop event propagation to prevent triggering onRowClick
          e.stopPropagation();
          openNotificationForm(row);
        }}
        className="p-2 text-blue-600 rounded-full hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors duration-200"
        title="Send Notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
    ),
  };

  // Add notification column to columns - ensuring columns are provided
  const tableColumns = [...columns, notificationColumn];

  // Calculate data to display based on current page
  const displayData = rowData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Open notification form for a single recipient
  const openNotificationForm = (recipient: any) => {
    setSelectedRecipient(recipient);
    setIsFormOpen(true);
  };

  // Open notification form for all recipients
  const openNotifyAllForm = () => {
    setIsNotifyAllFormOpen(true);
  };

  // Handle notification form submission for single recipient
  const handleNotificationSubmit = async (title: string, message: string) => {
    // alert(`Notification sent to ${selectedRecipient}\nTitle: ${title}\nMessage: ${message}`);
    console.log(selectedRecipient?.notification_token)
    // this is very important cuz otherwise it will be sent to all students
    if (!selectedRecipient?.notification_token) {
      alert('You cant send this student notification cuz maybe he is not logged in')
      return
    }

    await sendSingleNotification(
      title,
      message,
      notificationChannel, // this is recipient_type as channel name
      selectedRecipient?.id,
      selectedRecipient?.notification_token,
      (data) => {
        console.log(data)
        // Show success message
        setNotificationStatus({
          show: true,
          success: true,
          message: `Notification sent to ${selectedRecipient} successfully!`,
        });
        // Hide the status message after 3 seconds
        setTimeout(() => {
          setNotificationStatus((prev) => ({ ...prev, show: false }));
        }, 3000);
      },
      (data) => {
        console.log('fail to send notification from server', data)
      }
    )
  };



  // Handle notification form submission for all recipients
  const handleNotifyAllSubmit = async (title: string, message: string) => {
    // alert(`Notification sent to all students\nTitle: ${title}\nMessage: ${message}`);

    await sendMassNotification(
      title,
      message,
      notificationChannel,
      (data) => {
        // Show success message
        setNotificationStatus({
          show: true,
          success: true,
          message: `Notification sent to all students successfully!`,
        });
        // Hide the status message after 3 seconds
        setTimeout(() => {
          setNotificationStatus((prev) => ({ ...prev, show: false }));
        }, 3000);
      }
    )
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];

    // Add previous button
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

    // Show first page button
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

    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <span key="ellipsis1" className="px-3 py-1 mx-1">
          ...
        </span>
      );
    }

    // Page numbers
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

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="ellipsis2" className="px-3 py-1 mx-1">
          ...
        </span>
      );
    }

    // Show last page button
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

    // Add next button
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

  return (
    <div className="flex flex-col">
      {/* Notification status message */}
      {notificationStatus.show && (
        <div
          className={`p-4 mb-4 text-sm rounded-lg ${notificationStatus.success
            ? "bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800"
            : "bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800"
            }`}
        >
          {notificationStatus.message}
        </div>
      )}

      {/* Notify All Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openNotifyAllForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Notify All
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Dynamic Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {tableColumns.map((column, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Dynamic Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rowData.length === 0 ? (
                <TableRow>
                  <TableCell
                    // colSpan={tableColumns.length}
                    className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    onClick={() => onRowClick({ ...row, isUpdate: true })}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                  >
                    {tableColumns.map((column, columnIndex) => (
                      <TableCell
                        key={columnIndex}
                        className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        {column.render
                          ? column.render(row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {rowData.length > pageSize && (
        <div className="flex justify-center mt-4 py-4">
          {renderPagination()}
        </div>
      )}

      {/* Notification Form Modal for single recipient */}
      <NotificationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        recipient={selectedRecipient.name}
        onSubmit={handleNotificationSubmit}
      />

      {/* Notification Form Modal for all recipients */}
      <NotificationForm
        isOpen={isNotifyAllFormOpen}
        onClose={() => setIsNotifyAllFormOpen(false)}
        recipient="All Students"
        onSubmit={handleNotifyAllSubmit}
        isNotifyAll={true}
      />
    </div>
  );
}