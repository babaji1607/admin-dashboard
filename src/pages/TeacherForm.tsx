import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "../components/ui/alert/Alert";
import { createTeacher, updateTeacher } from "../api/Teachers";

const TeacherForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state || {};
    const isUpdate = data.isUpdate || false;

    const [isEditing, setIsEditing] = useState(!isUpdate);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const [form, setForm] = useState({
        name: data.name || "",
        age: data.age || "",
        contact: data.contact || "",
        subject: data.subject || "",
        address: data.address || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ["name", "age", "contact", "subject", "address"];
        const isEmptyField = requiredFields.some(field => {
            const value = form[field as keyof typeof form];
            return typeof value === "string" ? value.trim() === "" : !value;
        });

        if (isEmptyField) {
            setShowError(true);
            setShowSuccess(false);
            return;
        }

        const token = localStorage.getItem("token");

        const onSuccess = () => {
            setShowSuccess(true);
            setShowError(false);
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        };

        const onError = () => {
            setShowError(true);
            setShowSuccess(false);
        };

        if (isUpdate) {
            updateTeacher(token, data.id, form, onSuccess, onError);
        } else {
            createTeacher(token, form, onSuccess, onError);
        }
    };

    const renderField = (
        label: string,
        name: keyof typeof form,
        type: "text" | "number" | "textarea" = "text",
        editable: boolean = true
    ) => {
        const value = form[name];

        if (!isEditing || !editable) {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <p className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">{value || "N/A"}</p>
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
                        {isUpdate ? "Teacher Details" : "Create Teacher"}
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                    >
                        ← Go Back
                    </button>
                </div>

                <div className="mb-4">
                    {showError && (
                        <Alert
                            variant="error"
                            title="Error Message"
                            message="Please fill in all the required fields."
                            showLink={false}
                        />
                    )}
                    {showSuccess && (
                        <Alert
                            variant="success"
                            title="Success Message"
                            message="Form submitted successfully."
                            showLink={false}
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField("Name", "name", "text")}
                    {renderField("Age", "age", "number")}
                    {renderField("Contact", "contact", "text")}
                    {renderField("Subject", "subject", "text")}
                    {renderField("Address", "address", "textarea")}

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

export default TeacherForm;
