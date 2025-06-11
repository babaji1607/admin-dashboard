import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useEffect, useState } from "react";
import { getAllTeachers } from "../../api/Teachers";
import { useNavigate } from "react-router";

export default function TeacherTables() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }

        getAllTeachers(
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
        navigate("/teacher_form", { state: row });
    };

    return (
        <>
            <PageMeta
                title="Teachers Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is Teachers Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Teachers" />

            <div className="space-y-6">
                {/* Header and Create Button */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate("/teacher_form")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        <span className="text-lg">+</span>
                        <span>Create Teacher</span>
                    </button>
                </div>

                {/* Teachers Table */}
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
                    />
                </ComponentCard>
            </div>
        </>
    );
}