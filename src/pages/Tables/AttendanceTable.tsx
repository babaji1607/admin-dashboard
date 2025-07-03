import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import BasicTableTwo from "../../components/tables/BasicTables/BasicTableTwo";
import { getAttendanceSessions, deleteAttendanceSession } from "../../api/Attendance";

// ✅ Define the type of each row item
interface AttendanceSession {
  id: string;
  class_name: string;
  date: string;
}

export default function AttendanceTable() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<AttendanceSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const deleteAttendanceSessionRow = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token is not available or invalid");
        return;
      }
      await deleteAttendanceSession(
        token,
        sessionId,
        () => console.log("attendance session deleted successfully"),
        (error) => console.log("Failed to delete attendance session", error)
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
        getAttendanceSessions(
          page, // page
          10,   // limit
          token,
          undefined,
          undefined,
          undefined,
          (data: AttendanceSession[]) => {
            console.log("data", data);

            if (isInitial) {
              setTableData(data);
            } else {
              setTableData((prev) => [...prev, ...data]);
            }

            if (data.length < 10) {
              setHasMore(false);
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
      <PageBreadcrumb pageTitle="Attendance Sessions" />
      <div className="space-y-6">
        <ComponentCard title="Attendance Sessions">
          <BasicTableTwo
            rowData={tableData}
            navigationPath="/attendance-detail"
            deleteRow={deleteAttendanceSessionRow}
            loadMoreData={loadMoreData}
            hasMore={hasMore}
            isLoading={isLoading}
            columns={[
              {
                key: "id",
                header: "ID",
              },
              {
                key: "class_name",
                header: "Class",
              },
              {
                key: "date",
                header: "Date",
              },
            ]}
          />
        </ComponentCard>
      </div>
    </>
  );
}
