import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  XCircle,
  Calendar,
  BookOpen,
  User,
  GraduationCap,
  Info
} from 'lucide-react';
import { updateAttendanceSession } from '../api/Attendance';

// Import your updateAttendanceSession function
// import { updateAttendanceSession } from './your-api-file';

const AttendanceDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.rowData;

  // State management for edit mode and attendance records
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRecords, setEditedRecords] = useState(data?.records || []);
  const [isLoading, setIsLoading] = useState(false);

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        No attendance data found.
      </div>
    );
  }

  const { class_name, date, subject, teacher_id, records, id } = data;

  // Handle status toggle for individual student
  const handleStatusToggle = (index: number) => {
    if (!isEditMode) return;
    
    const updatedRecords = [...editedRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      status: updatedRecords[index].status === 'present' ? 'absent' : 'present'
    };
    setEditedRecords(updatedRecords);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    // Get token from wherever you store it (localStorage, context, etc.)
    const token = localStorage.getItem('token') || '';
    
    const payload = {
      date,
      teacher_id,
      subject,
      class_name,
      id,
      records: editedRecords
    };

    try {
      await updateAttendanceSession(
        token,
        id,
        payload,
        (response) => {
          // Success callback
          console.log('Success:', response.message);
          setIsEditMode(false);
          // You might want to show a success notification here
          alert('Attendance updated successfully!');
        },
        (error) => {
          // Error callback
          console.error('Error:', error.message);
          alert(`Error: ${error.message}`);
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel changes
  const handleCancel = () => {
    setEditedRecords(records);
    setIsEditMode(false);
  };

  return (
    <div className="w-full px-6 py-10">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-gray-200 transition flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Go Back
      </button>

      {/* Session Details */}
      <div className="mb-8 p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Attendance Session Info</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="font-medium">Class Name:</span> {class_name}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-600 dark:text-green-400" />
            <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Subject:</span> {subject}
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-orange-600 dark:text-orange-400" />
            <span className="font-medium">Teacher ID:</span> {teacher_id}
          </div>
        </div>
      </div>

      {/* Student Records */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Student Attendance</h2>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <Edit3 size={16} />
                Update Attendance
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition font-medium flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {editedRecords.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No student records available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.1]">
              <thead className="bg-gray-50 dark:bg-white/[0.05]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  {isEditMode && (
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {editedRecords.map((record: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                      {record.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        {record.status === 'present' ? (
                          <>
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400">Absent</span>
                          </>
                        )}
                      </div>
                    </td>
                    {isEditMode && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleStatusToggle(index)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                            record.status === 'present'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                          }`}
                        >
                          {record.status === 'present' ? (
                            <>
                              <UserX size={12} />
                              Mark Absent
                            </>
                          ) : (
                            <>
                              <UserCheck size={12} />
                              Mark Present
                            </>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Click on the "Mark Present/Absent" buttons to toggle student attendance status, then click "Save Changes" to update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetail;