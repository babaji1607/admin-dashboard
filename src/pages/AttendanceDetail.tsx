import { useLocation, useNavigate } from 'react-router';

const AttendanceDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.rowData;

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        No attendance data found.
      </div>
    );
  }

  const { class_name, date, subject, teacher_id, records } = data;

  return (
    <div className="w-full px-6 py-10">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-gray-200 transition"
      >
        ← Go Back
      </button>

      {/* Session Details */}
      <div className="mb-8 p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Attendance Session Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <div><span className="font-medium">Class Name:</span> {class_name}</div>
          <div><span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}</div>
          <div><span className="font-medium">Subject:</span> {subject}</div>
          <div><span className="font-medium">Teacher ID:</span> {teacher_id}</div>
        </div>
      </div>

      {/* Student Records */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Student Attendance</h2>

        {records.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No student records available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.1]">
              <thead className="bg-gray-50 dark:bg-white/[0.05]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {records.map((record: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                      {record.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                      {record.status === 'present' ? (
                        <span className="text-green-600 dark:text-green-400">Present</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Absent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetail;
