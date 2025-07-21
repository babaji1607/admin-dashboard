import { useState, useEffect, useRef, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import NotificationForm from "./NotificationForm";
import { sendMassNotification } from "../../../api/Notifications";
import { deleteUser } from "../../../api/Auth";

interface Column {
    key: string;
    header: string;
    render?: (row: any) => React.ReactNode;
}

interface DynamicTableProps {
    columns: Column[];
    rowData: any[];
    onRowClick?: (row: any) => void;
    notificationChannel: string;
    deleteRow?: (row: any) => Promise<void> | void;
    onRowDeleted?: (deletedRow: any) => void;
    // New props for infinite scroll
    hasMore?: boolean;
    isLoading?: boolean;
    onLoadMore?: () => Promise<void> | void;
    initialDisplayCount?: number;
}

export default function BasicTableForClass({
    columns,
    rowData,
    // notificationChannel,
    onRowClick = () => { },
    deleteRow = () => { },
    onRowDeleted = () => { },
    hasMore = false,
    isLoading = false,
    onLoadMore = () => { },
    initialDisplayCount = 10
}: DynamicTableProps) {
    // Local state for managing row data with deletions
    const [localRowData, setLocalRowData] = useState<any[]>(rowData);
    // Track how many items to display for infinite scroll
    const [displayCount, setDisplayCount] = useState<number>(initialDisplayCount);

    // Refs for infinite scroll
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);

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

    // Delete confirmation state
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        rowToDelete: any;
        isDeleting: boolean;
    }>({
        isOpen: false,
        rowToDelete: null,
        isDeleting: false,
    });

    // Update local data when rowData prop changes
    useEffect(() => {
        setLocalRowData(rowData);
    }, [rowData]);

    // Infinite scroll logic
    const loadMoreItems = useCallback(async () => {
        if (isLoading) return;

        // If we have more data locally, show more items
        if (displayCount < localRowData.length) {
            setDisplayCount(prev => Math.min(prev + initialDisplayCount, localRowData.length));
            return;
        }

        // If we need to load more data from server
        if (hasMore && onLoadMore) {
            await onLoadMore();
        }
    }, [displayCount, localRowData.length, hasMore, isLoading, onLoadMore, initialDisplayCount]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && (displayCount < localRowData.length || hasMore)) {
                    loadMoreItems();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        );

        const currentLoadingRef = loadingRef.current;
        if (currentLoadingRef) {
            observer.observe(currentLoadingRef);
        }

        return () => {
            if (currentLoadingRef) {
                observer.unobserve(currentLoadingRef);
            }
        };
    }, [loadMoreItems, displayCount, localRowData.length, hasMore]);

    // Add notification action column
    const notificationColumn: Column = {
        key: "action",
        header: "Notify",
        render: (row) => (
            <button
                onClick={(e) => {
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

    // Add delete action column
    // const deleteColumn: Column = {
    //     key: "delete",
    //     header: "Delete",
    //     render: (row) => (
    //         <button
    //             onClick={(e) => {
    //                 e.stopPropagation();
    //                 openDeleteConfirmation(row);
    //             }}
    //             className="p-2 text-red-600 rounded-full hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors duration-200"
    //             title="Delete Row"
    //         >
    //             <svg
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 className="w-5 h-5"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //                 stroke="currentColor"
    //             >
    //                 <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth={2}
    //                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    //                 />
    //             </svg>
    //         </button>
    //     ),
    // };

    // Add notification and delete columns to columns
    const tableColumns = [...columns, notificationColumn];

    // Calculate data to display based on displayCount
    const displayData = localRowData.slice(0, displayCount);

    // Open notification form for a single recipient
    const openNotificationForm = (recipient: any) => {
        setSelectedRecipient(recipient);
        setIsFormOpen(true);
    };

    // Open notification form for all recipients
    const openNotifyAllForm = () => {
        setIsNotifyAllFormOpen(true);
    };

    // Open delete confirmation dialog
    // const openDeleteConfirmation = (row: any) => {
    //     setDeleteConfirmation({
    //         isOpen: true,
    //         rowToDelete: row,
    //         isDeleting: false
    //     });
    // };

    // Close delete confirmation dialog
    const closeDeleteConfirmation = () => {
        if (!deleteConfirmation.isDeleting) {
            setDeleteConfirmation({
                isOpen: false,
                rowToDelete: null,
                isDeleting: false,
            });
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (deleteConfirmation.rowToDelete && !deleteConfirmation.isDeleting) {
            try {
                setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

                await deleteUserCredentials(deleteConfirmation.rowToDelete.user.id)
                await deleteRow(deleteConfirmation.rowToDelete.id);

                const deletedRow = deleteConfirmation.rowToDelete;
                setLocalRowData(prevData =>
                    prevData.filter(row =>
                        row.id ? row.id !== deletedRow.id : row !== deletedRow
                    )
                );

                onRowDeleted(deletedRow);

                setNotificationStatus({
                    show: true,
                    success: true,
                    message: "Row deleted successfully!",
                });

                setTimeout(() => {
                    setNotificationStatus((prev) => ({ ...prev, show: false }));
                }, 3000);

            } catch (error) {
                console.error('Error deleting row:', error);

                setNotificationStatus({
                    show: true,
                    success: false,
                    message: "Failed to delete row. Please try again.",
                });

                setTimeout(() => {
                    setNotificationStatus((prev) => ({ ...prev, show: false }));
                }, 3000);
            } finally {
                setDeleteConfirmation({
                    isOpen: false,
                    rowToDelete: null,
                    isDeleting: false,
                });
            }
        }
    };

    const deleteUserCredentials = async (userId: string) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('There is not token to process request')
                return
            }
            await deleteUser(
                token,
                userId,
                (data) => {
                    console.log('User deleted successfully', data)
                },
                (error) => console.log('Something went wrong', error)
            )
        } catch (e) {
            console.log(e)
        }
    }

    // Handle notification form submission for single recipient
    const handleNotificationSubmit = async (title: string, message: string) => {
        // console.log(selectedRecipient?.notification_token)
        // if (!selectedRecipient?.notification_token) {
        //     alert('You cant send this student notification cuz maybe he is not logged in')
        //     return
        // }

        await sendMassNotification(
            title,
            message,
            selectedRecipient.id,
            (data) => {
                console.log(data)
                setNotificationStatus({
                    show: true,
                    success: true,
                    message: `Notification sent to all students successfully!`,
                });
                setTimeout(() => {
                    setNotificationStatus((prev) => ({ ...prev, show: false }));
                }, 3000);
            },
            (error) => {
                console.log(error)
            }
        )
    };

    // Handle notification form submission for all recipients
    const handleNotifyAllSubmit = async (title: string, message: string) => {
        await sendMassNotification(
            title,
            message,
            "global",
            (data) => {
                console.log(data)
                setNotificationStatus({
                    show: true,
                    success: true,
                    message: `Notification sent to all students successfully!`,
                });
                setTimeout(() => {
                    setNotificationStatus((prev) => ({ ...prev, show: false }));
                }, 3000);
            },
            (error) => {
                console.log(error)
            }
        )
    };

    const showLoadingIndicator = displayCount < localRowData.length || (hasMore && !isLoading);
    const showSpinner = isLoading;

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

            <div
                ref={tableContainerRef}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
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
                            {localRowData.length === 0 ? (
                                <TableRow>
                                    <TableCell
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

                {/* Loading indicator for infinite scroll */}
                {(showLoadingIndicator || showSpinner) && (
                    <div
                        ref={loadingRef}
                        className="flex justify-center items-center py-4 border-t border-gray-100 dark:border-white/[0.05]"
                    >
                        {showSpinner ? (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Loading more...</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 dark:text-gray-500 text-sm">
                                Scroll to load more
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
                        onClick={closeDeleteConfirmation}
                    ></div>

                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mx-4 max-w-md w-full">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                            Confirm Delete
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                            Are you sure you want to delete this row? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={closeDeleteConfirmation}
                                disabled={deleteConfirmation.isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteConfirmation.isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                            >
                                {deleteConfirmation.isDeleting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
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
                recipient="All Students and Teachers"
                onSubmit={handleNotifyAllSubmit}
                isNotifyAll={true}
            />
        </div>
    );
}