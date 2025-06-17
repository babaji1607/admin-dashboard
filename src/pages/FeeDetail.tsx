import { useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { GLOBAL_URL } from '../../utils';

// Define the student details interface
interface StudentDetails {
  name?: string;
  age?: number;
  classroom?: {
    name?: string;
  };
  FatherName?: string;
  MotherName?: string;
  contact?: string;
  address?: string;
  user?: {
    email?: string;
  };
  FatherContact?: string;
  MotherContact?: string;
  class_id?: string;
}

// Function to fetch student details
const fetchStudentDetails = async (studentId: string, authToken: string | null): Promise<StudentDetails> => {
  try {
    const response = await fetch(
      `${GLOBAL_URL}/students/student/${studentId}/`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const studentData = await response.json();
    return studentData;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

const FeeReceiptDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.rowData;

  // State for student details with proper typing
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You'll need to provide the auth token - this should come from your auth context/state
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    // Fetch student details when component mounts and we have student_id
    if (data?.student_id) {
      setLoading(true);
      fetchStudentDetails(data.student_id, authToken)
        .then(student => {
          setStudentDetails(student);
          setError(null);
        })
        .catch(err => {
          setError('Failed to fetch student details');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [data?.student_id, authToken]);

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        No data found in navigation state.
      </div>
    );
  }

  // Enhanced fields with student details
  const fields = [
    { label: 'Student ID', value: data.student_id },
    { label: 'Student Name', value: studentDetails?.name || 'Loading...' },
    { label: 'Student Age', value: studentDetails?.age || '—' },
    { label: 'Class', value: studentDetails?.classroom?.name || '—' },
    { label: 'Father Name', value: studentDetails?.FatherName || '—' },
    { label: 'Mother Name', value: studentDetails?.MotherName || '—' },
    { label: 'Contact', value: studentDetails?.contact || '—' },
    { label: 'Address', value: studentDetails?.address || '—' },
    { label: 'Email', value: studentDetails?.user?.email || '—' },
    { label: 'Total Amount', value: `₹ ${data.total_amount}` },
    { label: 'Paid On', value: new Date(data.paid_on).toLocaleString() },
    { label: 'Payment Reference', value: data.payment_reference ?? '—' },
    { label: 'Remarks', value: data.remarks ?? '—' },
    { label: 'Receipt ID', value: data.id ?? '—' },
  ];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-gray-200 transition"
      >
        ← Go Back
      </button>

      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Fee Receipt Details
      </h2>

      {/* Loading indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300 text-center">
          Loading student details...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{field.label}</span>
            <span className="text-gray-800 font-medium dark:text-gray-200">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Additional student information section */}
      {studentDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">
            Additional Student Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Father Contact</span>
              <span className="text-gray-700 dark:text-gray-300">{studentDetails?.FatherContact || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Mother Contact</span>
              <span className="text-gray-700 dark:text-gray-300">{studentDetails?.MotherContact || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Class ID</span>
              <span className="text-gray-700 dark:text-gray-300">{studentDetails?.class_id || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeReceiptDetailPage;