import { useLocation, useNavigate } from "react-router";

interface Teacher {
  name: string;
  age: number;
  contact: string;
  subject: string;
  address: string;
}

interface Student {
  id: string;
  name: string;
  age: number;
  contact: string;
  address: string;
}

interface ClassroomData {
  name: string;
  teacher_id: string;
  id: string;
  teacher: Teacher | null;
  students: Student[];
}

const ClassroomForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state || {}) as ClassroomData;

  const renderField = (label: string, value: string | number | undefined | null) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
        {value !== undefined && value !== null ? value : "N/A"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Classroom Details
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            ← Go Back
          </button>
        </div>

        {/* Classroom Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Classroom Information
            </h3>
          </div>
          {renderField("Classroom Name", data.name)}
          {renderField("Classroom ID", data.id)}
        </div>

        {/* Teacher Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Teacher Information
            </h3>
            {!data.teacher && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No teacher assigned to this classroom
              </p>
            )}
          </div>
          {data.teacher && (
            <>
              {renderField("Teacher Name", data.teacher.name)}
              {renderField("Teacher ID", data.teacher_id)}
              {renderField("Age", data.teacher.age)}
              {renderField("Contact", data.teacher.contact)}
              {renderField("Subject", data.teacher.subject)}
              {renderField("Address", data.teacher.address)}
            </>
          )}
        </div>

        {/* Students Info */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Students ({data.students?.length || 0})
          </h3>
          {data.students && data.students.length > 0 ? (
            <ul className="space-y-2">
              {data.students.map((student) => (
                <li
                  key={student.id}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white"
                >
                  <span className="font-medium">Name:</span> {student.name} <br />
                  <span className="font-medium">ID:</span> {student.id}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No students enrolled in this classroom
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomForm;
