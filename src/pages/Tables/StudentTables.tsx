import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useEffect, useState } from "react";
import { getAllStudents } from "../../api/Students";
import { useNavigate } from "react-router";

export default function StudentTables() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);


    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }

        getAllStudents(
            0,
            10,
            token,
            (data) => {
                console.log("data", data);
                setTableData(data);
            },
            () => {
                console.log("error");
            }
        );
    }, []);

    const handleRowClick = (row: any) => {
        navigate("/student_form", { state: row });
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
                    />
                </ComponentCard>
            </div>
        </>
    );
}
