import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { getAllReceipts } from "../../api/FeeReceipts";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";

export default function FeeReceipts() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }
        getAllReceipts(1, 10, token, data => { // it follows page pattern
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
                        navigationPath="/fee-detail"
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
                                header: "Sutdent ID"
                            }
                        ]}
                    />
                </ComponentCard>
            </div>
        </>
    );
}
