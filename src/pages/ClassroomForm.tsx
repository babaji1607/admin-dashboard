import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { createFeePost } from "../api/Feepost";

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

// Define interface for fee key-value pairs
interface FeeItem {
  id: string;
  fee_type: string;
  fee_amount: string;
}

// Define interface for classroom fee form
interface ClassroomFeeFormData {
  title: string;
  other_fee: FeeItem[];
  deadline: string;
  is_paid: boolean;
  mode: "online" | "offline";
}

const ClassroomForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use sample data if no data is provided
  const defaultData: ClassroomData = {
    name: "Mathematics Class A",
    teacher_id: "TCH001",
    id: "CLS001",
    teacher: {
      name: "Dr. Sarah Johnson",
      age: 35,
      contact: "sarah.johnson@school.edu",
      subject: "Mathematics",
      address: "123 Academic Street"
    },
    students: [
      { id: "STU001", name: "John Doe", age: 16, contact: "john@student.com", address: "456 Student Ave" },
      { id: "STU002", name: "Jane Smith", age: 15, contact: "jane@student.com", address: "789 Learning Blvd" },
      { id: "STU003", name: "Mike Johnson", age: 16, contact: "mike@student.com", address: "321 Education St" },
      { id: "STU004", name: "Emily Davis", age: 15, contact: "emily@student.com", address: "654 School Lane" }
    ]
  };

  const data = (location.state as ClassroomData) || defaultData;

  const [showFeeForm, setShowFeeForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feeFormData, setFeeFormData] = useState<ClassroomFeeFormData>({
    title: "",
    other_fee: [{ id: "1", fee_type: "", fee_amount: "" }],
    deadline: "",
    is_paid: false,
    mode: "online",
  });

  const [alert, setAlert] = useState({
    type: "success" as "success" | "error",
    message: "",
    show: false,
  });

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

  const handleFeeFormChange = (field: keyof ClassroomFeeFormData, value: any) => {
    setFeeFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeeItemChange = (id: string, field: keyof FeeItem, value: string) => {
    setFeeFormData(prev => ({
      ...prev,
      other_fee: prev.other_fee.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addFeeItem = () => {
    const newId = Date.now().toString();
    setFeeFormData(prev => ({
      ...prev,
      other_fee: [...prev.other_fee, { id: newId, fee_type: "", fee_amount: "" }]
    }));
  };

  const removeFeeItem = (id: string) => {
    setFeeFormData(prev => ({
      ...prev,
      other_fee: prev.other_fee.filter(item => item.id !== id)
    }));
  };

  const showAlert = (type: "success" | "error", message: string, duration: number = 5000) => {
    setAlert({
      type,
      message,
      show: true,
    });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), duration);
  };

  const handleFeeFormSubmit = async () => {
    // Basic validation
    if (!feeFormData.title.trim()) {
      showAlert("error", "Please enter a title for the fee post", 3000);
      return;
    }

    const hasValidFees = feeFormData.other_fee.some(item =>
      item.fee_type.trim() && item.fee_amount.trim()
    );

    if (!hasValidFees) {
      showAlert("error", "Please add at least one fee item with both type and amount", 3000);
      return;
    }

    if (!feeFormData.deadline) {
      showAlert("error", "Please select a deadline for the fee payment", 3000);
      return;
    }

    if (data.students.length === 0) {
      showAlert("error", "No students found in this classroom", 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert other_fee array to key-value pairs object with number values
      const otherFeeObject = feeFormData.other_fee.reduce((acc, item) => {
        if (item.fee_type.trim() && item.fee_amount.trim()) {
          acc[item.fee_type.trim()] = parseFloat(item.fee_amount) || 0;
        }
        return acc;
      }, {} as Record<string, number>);

      // Create fee posts for each student
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      console.log("=== CREATING FEE POSTS FOR CLASSROOM ===");
      console.log(`Total students: ${data.students.length}`);
      console.log("Fee details:", otherFeeObject);

      for (const student of data.students) {
        const payload = {
          student_id: student.id,
          title: feeFormData.title,
          other_fee: otherFeeObject,
          deadline: new Date(feeFormData.deadline).toISOString(),
          is_paid: feeFormData.is_paid,
          mode: feeFormData.mode,
        };

        console.log(`Creating fee post for student: ${student.name} (${student.id})`);

        const result = await createFeePost(payload);
        results.push({
          student: student.name,
          studentId: student.id,
          success: result.success,
          message: result.message,
        });

        if (result.success) {
          successCount++;
          console.log(`✓ Success for ${student.name}: ${result.message}`);
        } else {
          errorCount++;
          errors.push(`${student.name}: ${result.message}`);
          console.log(`✗ Error for ${student.name}: ${result.message}`);
        }
      }

      console.log("=== RESULTS SUMMARY ===");
      console.log(`Total processed: ${results.length}`);
      console.log(`Successful: ${successCount}`);
      console.log(`Failed: ${errorCount}`);
      console.log("Detailed results:", results);
      console.log("=== END RESULTS ===");

      // Show result message
      if (successCount === data.students.length) {
        showAlert("success", `Fee post successfully created for all ${successCount} students!`);

        // Reset form on complete success
        setFeeFormData({
          title: "",
          other_fee: [{ id: "1", fee_type: "", fee_amount: "" }],
          deadline: "",
          is_paid: false,
          mode: "online",
        });
      } else if (successCount > 0) {
        showAlert("success", `Fee post created for ${successCount} students. ${errorCount} failed. Check console for details.`);
      } else {
        showAlert("error", `Failed to create fee posts for all students. Check console for details.`);
      }

    } catch (error) {
      console.error("Unexpected error during fee post creation:", error);
      showAlert("error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Alert */}
        {alert.show && (
          <div className="mb-6">
            <div className={`p-4 rounded-md ${alert.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {alert.type === "success" ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${alert.type === "success"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                    }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Students ({data.students?.length || 0})
            </h3>
            <button
              onClick={() => setShowFeeForm(!showFeeForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium flex items-center gap-2"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {showFeeForm ? "Hide Fee Form" : "Send Fee Post to All"}
            </button>
          </div>

          {data.students && data.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.students.map((student) => (
                <div
                  key={student.id}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                >
                  <div className="font-medium text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span> {student.name}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">ID:</span> {student.id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No students enrolled in this classroom
            </p>
          )}
        </div>

        {/* Fee Form */}
        {showFeeForm && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Send Fee Post to All Students
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                Will be sent to {data.students.length} students
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={feeFormData.title}
                  onChange={(e) => handleFeeFormChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter title for fee post (e.g., Monthly Tuition Fee)"
                  disabled={isSubmitting}
                />
              </div>

              {/* Other Fee Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Details *
                </label>
                <div className="space-y-3 bg-white dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                  {feeFormData.other_fee.map((feeItem) => (
                    <div key={feeItem.id} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={feeItem.fee_type}
                          onChange={(e) => handleFeeItemChange(feeItem.id, "fee_type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Fee type (e.g., Tuition, Books, Lab)"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={feeItem.fee_amount}
                          onChange={(e) => handleFeeItemChange(feeItem.id, "fee_amount", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          disabled={isSubmitting}
                        />
                      </div>
                      {feeFormData.other_fee.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeeItem(feeItem.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          disabled={isSubmitting}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeeItem}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Fee Item
                  </button>
                </div>
              </div>

              {/* Deadline Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={feeFormData.deadline}
                  onChange={(e) => handleFeeFormChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>

              {/* Is Paid Switch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={feeFormData.is_paid}
                      onChange={(e) => handleFeeFormChange("is_paid", e.target.checked)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div
                      onClick={() => !isSubmitting && handleFeeFormChange("is_paid", !feeFormData.is_paid)}
                      className={`w-11 h-6 rounded-full transition-colors ${isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        } ${feeFormData.is_paid ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      <div
                        className={`w-4 h-4 relative top-1 rounded-full bg-white shadow-md transform transition-transform ${feeFormData.is_paid ? "translate-x-6" : "translate-x-1"
                          } mt-1`}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {feeFormData.is_paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Mode Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Mode
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="online"
                      checked={feeFormData.mode === "online"}
                      onChange={(e) => handleFeeFormChange("mode", e.target.value as "online" | "offline")}
                      className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Online</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="offline"
                      checked={feeFormData.mode === "offline"}
                      onChange={(e) => handleFeeFormChange("mode", e.target.value as "online" | "offline")}
                      className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Offline</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-4">
                <button
                  onClick={handleFeeFormSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-md transition font-medium flex items-center justify-center gap-2 ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Creating Fee Posts...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Fee Post to All {data.students.length} Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomForm;