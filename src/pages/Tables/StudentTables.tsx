import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useEffect, useState, useCallback } from "react";
import { getAllStudents, deleteStudent } from "../../api/Students";
import { useNavigate } from "react-router";

export default function StudentTables() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const handleStudentDelete = async (studentId: string) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('There is not token to process request')
                navigate('/')
                return
            }
            await deleteStudent(
                token,
                studentId,
                (data) => {
                    console.log('Student deleted successfully', data)
                },
                (error) => console.log('Something went wrong while deleting', error)
            )
        } catch (e) {
            console.log(e)
        }
    }

    // Function to load students with pagination
    const loadStudents = useCallback(async (page: number = 0, append: boolean = false) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);
        
        try {
            await new Promise<void>((resolve, reject) => {
                getAllStudents(
                    page,
                    pageSize,
                    token,
                    (data) => {
                        console.log("data", data);
                        
                        if (append) {
                            // Append new data to existing data
                            setTableData(prevData => [...prevData, ...data]);
                        } else {
                            // Replace data (for initial load)
                            setTableData(data);
                        }
                        
                        // Check if we have more data
                        setHasMore(data.length === pageSize);
                        setCurrentPage(page);
                        resolve();
                    },
                    (error) => {
                        console.log("error", error);
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error("Failed to load students:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, pageSize]);

    // Load more data for infinite scroll
    const handleLoadMore = useCallback(async () => {
        if (!isLoading && hasMore) {
            await loadStudents(currentPage + 1, true);
        }
    }, [currentPage, isLoading, hasMore, loadStudents]);

    // Initial load
    useEffect(() => {
        loadStudents(0, false);
    }, [loadStudents]);

    const handleRowClick = (row: any) => {
        navigate("/student_form", { state: row });
    };

    // Handle when a row is deleted (update local state)
    const handleRowDeleted = (deletedRow: any) => {
        setTableData(prevData => 
            prevData.filter(student => student.id !== deletedRow.id)
        );
    };

    return (
        <>
            <PageMeta
                title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Students" />
            <div className="space-y-6">
                {/* Header and Create Button */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate("/student_form")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        <span className="text-lg">+</span>
                        <span>Create Student</span>
                    </button>
                </div>
                
                {/* Students Table */}
                <ComponentCard title="Students data">
                    <BasicTableOne
                        rowData={tableData}
                        notificationChannel={'student'}
                        columns={[
                            { key: "id", header: "ID" },
                            { key: "name", header: "Name" },
                            { key: "contact", header: "Contact" },
                        ]}
                        onRowClick={handleRowClick}
                        deleteRow={handleStudentDelete}
                        onRowDeleted={handleRowDeleted}
                        // Infinite scroll props
                        hasMore={hasMore}
                        isLoading={isLoading}
                        onLoadMore={handleLoadMore}
                        initialDisplayCount={10}
                    />
                </ComponentCard>
            </div>
        </>
    );
}