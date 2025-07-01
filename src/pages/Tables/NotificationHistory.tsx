import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useCallback } from "react";
import { getNotificationHistory, deleteNotification } from "../../api/Notifications";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

export default function NotificationHistory() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Function to format UTC date to readable format
    const formatDate = (utcDateString: string) => {
        try {
            const date = new Date(utcDateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            // Format options
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata' // IST timezone for India
            };

            return date.toLocaleString('en-IN', options);
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    const deleteNotificationRow = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('Token is not available or invalid');
                return;
            }
            await deleteNotification(
                token,
                notificationId,
                (data) => console.log('Notification deleted successfully', data),
                (error) => console.log('Failed to delete Notification', error)
            );
        } catch (e) {
            console.log(e);
        }
    };

    const loadData = useCallback(async (page: number, isInitial = false) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);
        
        return new Promise<void>((resolve, reject) => {
            // Note: You may need to modify getNotificationHistory API to accept page and limit parameters
            // For now, using the existing API structure
            getNotificationHistory(
                token, 
                (data) => {
                    console.log('data', data);
                    
                    // If API doesn't support pagination yet, we'll handle client-side pagination
                    // You should modify the API to accept page and limit parameters
                    const pageSize = 10;
                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedData = data.slice(startIndex, endIndex);
                    
                    if (isInitial) {
                        setTableData(paginatedData);
                        // Set hasMore based on total data length
                        setHasMore(data.length > pageSize);
                    } else {
                        setTableData(prev => [...prev, ...paginatedData]);
                        // Check if we have more data
                        const totalLoaded = (page * pageSize);
                        setHasMore(totalLoaded < data.length);
                    }
                    
                    setIsLoading(false);
                    resolve();
                }, 
                (error) => {
                    console.log('error', error);
                    setIsLoading(false);
                    reject(error);
                }
            );
        });
    }, [navigate]);

    const loadMoreData = useCallback(() => {
        if (!isLoading && hasMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            return loadData(nextPage, false);
        }
        return Promise.resolve();
    }, [currentPage, isLoading, hasMore, loadData]);

    useEffect(() => {
        loadData(1, true);
    }, []);

    return (
        <>
            <PageMeta
                title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Notification History" />
            <div className="space-y-6">
                <ComponentCard title="Notification History">
                    <BasicTableTwo
                        rowData={tableData}
                        deleteRow={deleteNotificationRow}
                        loadMoreData={loadMoreData}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        columns={[
                            {
                                key: "title",
                                header: "Title"
                            },
                            {
                                key: "message",
                                header: "Message"
                            },
                            {
                                key: "created_at",
                                header: "Creation Date",
                                render: (row) => (
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {formatDate(row.created_at)}
                                    </span>
                                )
                            },
                            {
                                key: "recipient_type",
                                header: "Type"
                            }
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}