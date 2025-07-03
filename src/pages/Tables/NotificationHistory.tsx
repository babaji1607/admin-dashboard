import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useCallback } from "react";
import { getNotificationHistory, deleteNotification } from "../../api/Notifications";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

interface NotificationRow {
    id: string;
    title: string;
    message: string;
    created_at: string;
    recipient_type: string;
}

export default function NotificationHistory() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState<NotificationRow[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Function to format UTC date to readable format
    const formatDate = (utcDateString: string) => {
        try {
            const date = new Date(utcDateString);
            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
            };
            return date.toLocaleString("en-IN", options);
        } catch (error) {
            console.error("Date formatting error:", error);
            return "Invalid Date";
        }
    };

    const deleteNotificationRow = async (notificationId: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("Token is not available or invalid");
                return;
            }
            await deleteNotification(
                token,
                notificationId,
                (data) => console.log("Notification deleted successfully", data),
                (error) => console.log("Failed to delete Notification", error)
            );
        } catch (e) {
            console.log(e);
        }
    };

    const loadData = useCallback(
        async (page: number, isInitial = false) => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/signin");
                return;
            }

            setIsLoading(true);

            return new Promise<void>((resolve, reject) => {
                getNotificationHistory(
                    token,
                    (data: NotificationRow[]) => {
                        console.log("data", data);
                        const pageSize = 10;
                        const startIndex = (page - 1) * pageSize;
                        const endIndex = startIndex + pageSize;
                        const paginatedData = data.slice(startIndex, endIndex);

                        if (isInitial) {
                            setTableData(paginatedData);
                            setHasMore(data.length > pageSize);
                        } else {
                            setTableData((prev) => [...prev, ...paginatedData]);
                            const totalLoaded = page * pageSize;
                            setHasMore(totalLoaded < data.length);
                        }

                        setIsLoading(false);
                        resolve();
                    },
                    (error: any) => {
                        console.log("error", error);
                        setIsLoading(false);
                        reject(error);
                    }
                );
            });
        },
        [navigate]
    );

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
                                header: "Title",
                            },
                            {
                                key: "message",
                                header: "Message",
                            },
                            {
                                key: "created_at",
                                header: "Creation Date",
                                render: (row: NotificationRow) => (
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {formatDate(row.created_at)}
                                    </span>
                                ),
                            },
                            {
                                key: "recipient_type",
                                header: "Type",
                            },
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}
