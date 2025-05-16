import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "../components/ui/alert/Alert";
import { createStudent, updateStudent, deleteStudent } from "../api/Students";
import { v4 as uuidv4 } from 'uuid'

const StudentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  const isUpdate = data.isUpdate || false;

  const [isEditing, setIsEditing] = useState(!isUpdate); // Editable only in Create mode initially
  const [form, setForm] = useState({
    name: data.name || "",
    age: data.age || "",
    class_name: data.class_name || "",
    contact: data.contact || "",
    address: data.address || "",
    parent_id: data.parent_id || uuidv4(),
    class_teacher_id: data.class_teacher_id || uuidv4(),
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return form.name && form.age && form.class_name && form.contact && form.address;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        type: "error",
        message: "Please fill out all required fields before submitting.",
        show: true,
      });
      return;
    }

    const token = localStorage.getItem("token"); // or from context/provider
    if (!token) {
      // setAlert({
      //   type: "error",
      //   message: "You must be logged in to perform this action.",
      //   show: true,
      // });
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
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }, () => {
        setAlert({
          type: "error",
          message: "Failed to update student.",
          show: true,
        });
      });
    } else {
      createStudent(token, form, () => {
        setAlert({
          type: "success",
          message: "Student created successfully.",
          show: true,
        });
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }, () => {
        setAlert({
          type: "error",
          message: "Failed to create student.",
          show: true,
        });
      });
    }
  };

  const renderField = (
    label: string,
    name: keyof typeof form,
    type: "text" | "number" | "textarea" = "text",
    editable: boolean = false
  ) => {
    const value = form[name];
    if (!isEditing || !editable) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
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
      required: true,
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {type === "textarea" ? (
          <textarea {...commonProps} rows={3} />
        ) : (
          <input type={type} {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isUpdate ? "Student Details" : "Create Student"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            ← Go Back
          </button>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField("Name", "name", "text", true)}
          {renderField("Age", "age", "number", true)}
          {renderField("Class Name", "class_name", "text", true)}
          {renderField("Contact", "contact", "text", true)}
          {renderField("Address", "address", "textarea", true)}
          {renderField("Parent ID", "parent_id", "text", false)}
          {renderField("Class Teacher ID", "class_teacher_id", "text", false)}

          <div className="md:col-span-2 flex justify-between items-center mt-6">
            {isUpdate && (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                {isEditing ? "Cancel Edit" : "Edit"}
              </button>
            )}

            {(isEditing || !isUpdate) && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
