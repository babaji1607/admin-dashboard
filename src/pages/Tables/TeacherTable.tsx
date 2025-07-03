import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useEffect, useState, useCallback } from "react";
import { getAllTeachers, deleteTeacher } from "../../api/Teachers";
import { useNavigate } from "react-router";

type Teacher = {
    id: string;
    name: string;
    subject: string;
    contact: string;
};

export default function TeacherTables() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState<Teacher[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const handleTeacherDelete = async (teacherId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('There is not token to process request');
                navigate('/');
                return;
            }
            await deleteTeacher(
                token,
                teacherId,
                (data) => {
                    console.log('Teacher deleted successfully', data);
                },
                (error) => console.log('Something went wrong while deleting', error)
            );
        } catch (e) {
            console.log(e);
        }
    };

    const loadTeachers = useCallback(async (page: number = 0, append: boolean = false) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);

        try {
            await new Promise<void>((resolve, reject) => {
                getAllTeachers(
                    page,
                    pageSize,
                    token,
                    (data) => {
                        console.log("data", data);

                        if (append) {
                            setTableData(prevData => [...prevData, ...data]);
                        } else {
                            setTableData(data);
                        }

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
            console.error("Failed to load teachers:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, pageSize]);

    const handleLoadMore = useCallback(async () => {
        if (!isLoading && hasMore) {
            await loadTeachers(currentPage + 1, true);
        }
    }, [currentPage, isLoading, hasMore, loadTeachers]);

    useEffect(() => {
        loadTeachers(0, false);
    }, [loadTeachers]);

    const handleRowClick = (row: any) => {
        navigate("/teacher_form", { state: row });
    };

    const handleRowDeleted = (deletedRow: any) => { // optimized update
        setTableData(prevData =>
            prevData.filter(teacher => teacher.id !== deletedRow.id)
        );
    };

    return (
        <>
            <PageMeta
                title="Teachers Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is Teachers Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Teachers" />

            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate("/teacher_form")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        <span className="text-lg">+</span>
                        <span>Create Teacher</span>
                    </button>
                </div>

                <ComponentCard title="Teachers data">
                    <BasicTableOne
                        rowData={tableData}
                        notificationChannel={'teacher'}
                        columns={[
                            { key: "id", header: "ID" },
                            { key: "name", header: "Name" },
                            { key: "subject", header: "Subject" },
                            { key: "contact", header: "Contact" },
                        ]}
                        onRowClick={handleRowClick}
                        deleteRow={handleTeacherDelete}
                        onRowDeleted={handleRowDeleted}
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
