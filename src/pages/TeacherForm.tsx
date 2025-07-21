import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "../components/ui/alert/Alert";
import { createTeacher, updateTeacher } from "../api/Teachers";
import { registerUser } from "../api/Auth";

const TeacherForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state || {};
    const isUpdate = data.isUpdate || false;

    const [isEditing, setIsEditing] = useState(!isUpdate);

    const [form, setForm] = useState({
        name: data.name || "",
        age: data.age || "",
        contact: data.contact || "",
        subject: data.subject || "",
        address: data.address || "",
    });

    const [authFields, setAuthFields] = useState({
        email: "",
        password: "",
        role: "teacher",
    });

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

    const validateForm = () => {
        // Basic form validation
        return form.name && form.age && form.contact && form.subject && form.address;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If in viewing mode (update but not editing), do nothing on submit
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
            updateTeacher(token, data.id, form, () => {
                setAlert({
                    type: "success",
                    message: "Teacher updated successfully.",
                    show: true,
                });
                setIsEditing(false);
                setTimeout(() => {
                    setAlert(prev => ({ ...prev, show: false }));
                }, 2000);
            }, (error) => {
                setAlert({
                    type: "error",
                    message: `Failed to update teacher: ${error?.message || "Unknown error"}`,
                    show: true,
                });
            });
        } else {
            registerUser(
                authFields.email,
                authFields.password,
                authFields.role,
                (userData) => {
                    console.log("User registered successfully", userData);
                    createTeacher(token, { ...form, user_id: userData.id }, () => {
                        setAlert({
                            type: "success",
                            message: "Teacher created successfully.",
                            show: true,
                        });
                        setTimeout(() => navigate(-1), 2000);
                    }, (error) => {
                        setAlert({
                            type: "error",
                            message: `Failed to create teacher: ${error?.message || "Unknown error"}`,
                            show: true,
                        });
                    });
                },
                (error) => {
                    console.error("Error registering user:", error);
                    setAlert({
                        type: "error",
                        message: `Failed to register user: ${error?.message || "Unknown error"}`,
                        show: true,
                    });
                }
            );
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

    // Render auth fields only when creating a new teacher
    const renderAuthFields = () => {
        if (isUpdate) return null;

        return (
            <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username (credentials)</label>
                    <input
                        type="text"
                        name="email"
                        value={authFields.email}
                        onChange={handleAuthChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={authFields.password}
                        onChange={handleAuthChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {isUpdate ? "Teacher Details" : "Create Teacher"}
                    </h2>
                    <div className="flex items-center space-x-4">
                        {isUpdate && (
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField("Name", "name", "text")}
                    {renderField("Age", "age", "number")}
                    {renderField("Contact", "contact", "text")}
                    {renderField("Subject", "subject", "text")}
                    {renderField("Address", "address", "textarea")}

                    {/* Auth fields only shown when creating a new teacher */}
                    {renderAuthFields()}

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            {isUpdate ? (isEditing ? "Update Teacher" : "View Teacher") : "Create Teacher"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;