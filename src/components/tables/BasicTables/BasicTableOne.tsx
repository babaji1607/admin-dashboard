import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Default table data to use as fallback
const defaultTableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "Active",
  },
];

interface Column {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface NotificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  onSubmit: (title: string, message: string) => void;
  isNotifyAll?: boolean;
}

// Notification Form Component
const NotificationForm = ({
  isOpen,
  onClose,
  recipient,
  onSubmit,
  isNotifyAll = false,
}: NotificationFormProps) => {
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setMessage("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, message);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isNotifyAll ? "Send Notification to All Students" : `Send Notification to ${recipient}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              {isNotifyAll ? "Notify All" : "Notify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DynamicTableProps {
  apiUrl?: string;
  columns?: Column[];
  pageSize?: number;
}

export default function DynamicTableWithNotification({
  apiUrl = "/api/orders",
  columns,
  pageSize = 5,
}: DynamicTableProps) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Notification form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isNotifyAllFormOpen, setIsNotifyAllFormOpen] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [notificationStatus, setNotificationStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({
    show: false,
    success: false,
    message: "",
  });

  // Define default columns if not provided
  const defaultColumns: Column[] = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <img
              width={40}
              height={40}
              src={row.user.image}
              alt={row.user.name}
            />
          </div>
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {row.user.name}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              {row.user.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "projectName",
      header: "Project Name",
    },
    {
      key: "team",
      header: "Team",
      render: (row) => (
        <div className="flex -space-x-2">
          {row.team.images.map((teamImage: string, index: number) => (
            <div
              key={index}
              className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
            >
              <img
                width={24}
                height={24}
                src={teamImage}
                alt={`Team member ${index + 1}`}
                className="w-full size-6"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          size="sm"
          color={
            row.status === "Active"
              ? "success"
              : row.status === "Pending"
                ? "warning"
                : "error"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "budget",
      header: "Budget",
    },
  ];

  // Add notification action column
  const notificationColumn: Column = {
    key: "action",
    header: "Notify",
    render: (row) => (
      <button
        onClick={() => openNotificationForm(row.user.name)}
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

  // Add notification column to columns
  const tableColumns = [...(columns || defaultColumns), notificationColumn];

  // Fetch data from API or use fallback data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}?page=${currentPage}&limit=${pageSize}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const result = await response.json();

        // Check if we have valid data
        if (result && Array.isArray(result.data)) {
          setData(result.data);
          setTotalPages(Math.ceil(result.total / pageSize));
        } else {
          // Use default data if API response doesn't contain expected format
          setData(defaultTableData);
          setTotalPages(Math.ceil(defaultTableData.length / pageSize));
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Using default data.");
        setData(defaultTableData);
        setTotalPages(Math.ceil(defaultTableData.length / pageSize));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, currentPage, pageSize]);

  // Calculate data to display based on current page (for default data fallback)
  const displayData = data.length > 0 ?
    data :
    defaultTableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Open notification form for a single recipient
  const openNotificationForm = (recipient: string) => {
    setSelectedRecipient(recipient);
    setIsFormOpen(true);
  };

  // Open notification form for all recipients
  const openNotifyAllForm = () => {
    setIsNotifyAllFormOpen(true);
  };

  // Handle notification form submission for single recipient
  const handleNotificationSubmit = (title: string, message: string) => {
    alert(`Notification sent to ${selectedRecipient}\nTitle: ${title}\nMessage: ${message}`);

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
  };

  // Handle notification form submission for all recipients
  const handleNotifyAllSubmit = (title: string, message: string) => {
    alert(`Notification sent to all students\nTitle: ${title}\nMessage: ${message}`);

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

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
          {error}
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : displayData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="px-5 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row) => (
                  <TableRow key={row.id}>
                    {tableColumns.map((column, columnIndex) => (
                      <TableCell
                        key={columnIndex}
                        className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400"
                      >
                        {column.render
                          ? column.render(row)
                          : column.key.includes(".")
                            ? column.key.split(".").reduce((obj, key) => obj?.[key], row)
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
      <div className="flex justify-center mt-4 py-4">
        {renderPagination()}
      </div>

      {/* Notification Form Modal for single recipient */}
      <NotificationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        recipient={selectedRecipient}
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