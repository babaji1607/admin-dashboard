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
        getAllTeachers(0, 10, token, data => {
            console.log('data', data);
            setTableData(data);
        }, () => {
            console.log('error');
        })
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
                    <BasicTableOne
                        rowData={tableData}
                        columns={[
                            {
                                key: "id",
                                header: "ID"
                            },
                            {
                                key: "name",
                                header: "Name"
                            },
                            {
                                key: "contact",
                                header: "Contact"
                            }
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}
