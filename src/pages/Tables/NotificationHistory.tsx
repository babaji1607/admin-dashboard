import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getNotificationHistory } from "../../api/Notifications";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

export default function NotificationHistory() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }
        getNotificationHistory(token, data => { // it follows page pattern
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
                    <BasicTableTwo
                        rowData={tableData}
                        columns={[
                            {
                                key: "title",
                                header: "Title"
                            },
                            {
                                key: "created_at",
                                header: "Creation Date"
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
