import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";
import { getAttendanceSessions } from "../../api/Attendance";

export default function AttendanceTable() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }
        getAttendanceSessions(
            1,                 // page
            100,                // limit
            token,             // auth token
            undefined,
            undefined,
            undefined,
            data => {          // onSuccess
                console.log('data', data);
                setTableData(data);
            },
            (error) => {            // onError
                console.log('error', error);
            }
        );
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
                        navigationPath="/attendance-detail"
                        columns={[
                            {
                                key: "id",
                                header: "ID"
                            },
                            {
                                key: "class_name",
                                header: "Class"
                            },
                            {
                                key: "date",
                                header: "Date"
                            }
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}
