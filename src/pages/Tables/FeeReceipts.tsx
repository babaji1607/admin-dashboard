import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useCallback } from "react";
import { getAllReceipts } from "../../api/FeeReceipts";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

export default function FeeReceipts() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async (page: number, isInitial = false) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);
        
        return new Promise<void>((resolve, reject) => {
            getAllReceipts(
                page, 
                10, 
                token, 
                (data) => {
                    console.log('data', data);
                    
                    if (isInitial) {
                        setTableData(data);
                    } else {
                        setTableData(prev => [...prev, ...data]);
                    }
                    
                    // Check if we have more data
                    if (data.length < 10) {
                        setHasMore(false);
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
            <PageBreadcrumb pageTitle="Students" />
            <div className="space-y-6">
                <ComponentCard title="Students data">
                    <BasicTableTwo
                        rowData={tableData}
                        navigationPath="/fee-detail"
                        loadMoreData={loadMoreData}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        columns={[
                            {
                                key: "paid_on",
                                header: "Pay Date"
                            },
                            {
                                key: "total_amount",
                                header: "Amount (₹/-)"
                            },
                            {
                                key: "student_id",
                                header: "Student ID"
                            }
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}