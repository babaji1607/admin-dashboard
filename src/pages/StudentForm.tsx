import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "../components/ui/alert/Alert";
import { createStudent, updateStudent } from "../api/Students";
import SelectDropdown from "../components/SelectDropdown";
import { registerUser } from "../api/Auth";
import AdditionalForm from "../components/FeePostForm";
import FeePostsList from "../components/FeePostList";
import { createFeePost } from "../api/Feepost";

// Define option type
interface OptionType {
  label: string;
  value: string | number;
}

type TabType = 'student' | 'createFee' | 'feeList';

const StudentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  const isUpdate = data.isUpdate || false;

  const [activeTab, setActiveTab] = useState<TabType>('student');
  const [isEditing, setIsEditing] = useState(!isUpdate);

  const [form, setForm] = useState({
    name: data.name || "",
    age: data.age || "",
    contact: data.contact || "",
    address: data.address || "",
    FatherName: data.FatherName || "",
    MotherName: data.MotherName || "",
    FatherContact: data.FatherContact || "",
    MotherContact: data.MotherContact || "",
    class_id: data.class_id || "",
    notification_token: data.notification_token || "",
    roll_number: data.roll_number || "",
    date_of_birth: data.date_of_birth || "",
  });

  const [authFields, setAuthFields] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const [selectedClass, setSelectedClass] = useState<OptionType | null>(
    data.class_id ? { label: data.class_name || data.class_id, value: data.class_id } : null
  );

  const [alert, setAlert] = useState({
    type: "success" as "success" | "error",
    message: "",
    show: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (option: OptionType | null) => {
    setSelectedClass(option);
    setForm(prev => ({
      ...prev,
      class_id: option ? option.value.toString() : ""
    }));
  };

  // Handler for additional form submission
  const handleAdditionalFormSubmit = async (payload: any) => {
    console.log("Additional form payload received in StudentForm:", payload);
    // You can handle the payload here as needed
    await createFeePost(payload);
    // After successful creation, switch to fee list tab
    setActiveTab('feeList');
  };

  const validateForm = () => {
    return form.name && form.class_id;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isUpdate && !isEditing) {
      return;
    }

    if (!validateForm()) {
      setAlert({
        type: "error",
        message: "Please fill out all required fields before submitting.",
        show: true,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    if (isUpdate) {
      updateStudent(token, data.id, form, () => {
        setAlert({
          type: "success",
          message: "Student updated successfully.",
          show: true,
        });
        setIsEditing(false);
        setTimeout(() => {
          setAlert(prev => ({ ...prev, show: false }));
        }, 2000);
      }, (error) => {
        setAlert({
          type: "error",
          message: `Failed to update student: ${error?.message || "Unknown error"}`,
          show: true,
        });
      });
    } else {
      registerUser(
        authFields.email,
        authFields.password,
        authFields.role,
        (userData) => {
          createStudent(token, { ...form, user_id: userData.id }, () => {
            setAlert({
              type: "success",
              message: "Student created successfully.",
              show: true,
            });
            setTimeout(() => navigate(-1), 2000);
          }, (error) => {
            setAlert({
              type: "error",
              message: `Failed to create student: ${error?.message || "Unknown error"}`,
              show: true,
            });
          });
        },
        (error) => {
          console.error("Error registering user:", error);
        }
      );
    }
  };

  const renderField = (
    label: string,
    name: keyof typeof form,
    type: "text" | "number" | "textarea" | "select" | "date" = "text",
    editable: boolean = false,
    required: boolean = false
  ) => {
    const value = form[name];

    if (name === "class_id") {
      if (!isEditing || !editable) {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}{required && <span className="text-red-500">*</span>}
            </label>
            <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
              {selectedClass ? selectedClass.label : value || ""}
            </p>
          </div>
        );
      }

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
          </label>
          <SelectDropdown
            value={selectedClass}
            onChange={handleClassChange}
            placeholder="Select class..."
            isClearable={true}
          />
        </div>
      );
    }

    if (!isEditing || !editable) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
          </label>
          <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
            {value || ""}
          </p>
        </div>
      );
    }

    const commonProps = {
      name,
      value,
      onChange: handleChange,
      className:
        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white",
      required: required,
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}{required && <span className="text-red-500">*</span>}
        </label>
        {type === "textarea" ? (
          <textarea {...commonProps} rows={3} />
        ) : (
          <input type={type} {...commonProps} />
        )}
      </div>
    );
  };

  const renderAuthFields = () => {
    if (isUpdate) return null;

    return (
      <>
        <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Information</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username(credentials)<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="email"
            value={authFields.email}
            onChange={handleAuthChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={authFields.password}
            onChange={handleAuthChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </>
    );
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'student', label: 'Student Information', icon: '👤' },
      ...(isUpdate && data?.id ? [
        { id: 'createFee' as TabType, label: 'Create Fee Post', icon: '💰' },
        { id: 'feeList' as TabType, label: 'Fee Posts List', icon: '📋' }
      ] : [])
    ];

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  };

  const renderStudentForm = () => (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Student Information</h3>
      </div>
      {renderField("Name", "name", "text", true, true)}
      {renderField("Age", "age", "number", true)}
      {renderField("Roll Number", "roll_number", "number", true)}
      {renderField("Date of Birth", "date_of_birth", "date", true)}
      {renderField("Contact", "contact", "text", true)}
      {renderField("Address", "address", "textarea", true)}
      {renderField("Class", "class_id", "select", true, true)}

      <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Parent Information</h3>
      </div>
      {renderField("Father's Name", "FatherName", "text", true)}
      {renderField("Father's Contact", "FatherContact", "text", true)}
      {renderField("Mother's Name", "MotherName", "text", true)}
      {renderField("Mother's Contact", "MotherContact", "text", true)}

      {renderAuthFields()}

      <div className="md:col-span-2 mt-4">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={isUpdate && !isEditing}
        >
          {isUpdate ? (isEditing ? "Update Student" : "View Student") : "Create Student"}
        </button>
      </div>
    </form>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'student':
        return renderStudentForm();
      case 'createFee':
        return (
          <AdditionalForm
            onSubmit={handleAdditionalFormSubmit}
            student_id={data.id}
          />
        );
      case 'feeList':
        return (
          <FeePostsList
            studentId={data.id}
          />
        );
      default:
        return renderStudentForm();
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isUpdate ? "Student Management" : "Create Student"}
          </h2>
          <div className="flex items-center space-x-4">
            {isUpdate && activeTab === 'student' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              ← Go Back
            </button>
          </div>
        </div>

        {alert.show && (
          <div className="mb-6">
            <Alert
              variant={alert.type}
              title={alert.type === "error" ? "Error Message" : "Success Message"}
              message={alert.message}
              showLink={alert.type === "error"}
              linkHref="/"
              linkText="Learn more"
            />
          </div>
        )}

        {renderTabs()}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StudentForm;