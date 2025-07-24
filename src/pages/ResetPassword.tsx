import { useState } from "react";
import { resetPassword } from "../api/Auth";

interface ResetPasswordData {
    username: string;
    newPassword: string;
    confirmNewPassword: string;
}

interface ResetPasswordProps {
    className?: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ className }) => {
    const [formData, setFormData] = useState<ResetPasswordData>({
        username: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errors, setErrors] = useState<Partial<ResetPasswordData>>({});

    const [alert, setAlert] = useState({
        type: "success" as "success" | "error",
        message: "",
        show: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific field error when user starts typing
        if (errors[name as keyof ResetPasswordData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<ResetPasswordData> = {};
        let isValid = true;

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
            isValid = false;
        }

        // New password validation
        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required";
            isValid = false;
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters long";
            isValid = false;
        }

        // Confirm password validation
        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = "Please confirm your new password";
            isValid = false;
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            newErrors.confirmNewPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!validateForm()) {
            return;
        }


        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmation(false);
        setIsSubmitting(true);
        setAlert({ ...alert, show: false });

        try {
            // TODO: Add your password reset logic here
            // Example: await resetUserPassword(formData);
            const token = localStorage.getItem('token')
            if (!token) {
                window.alert('No token is present')
                return
            }
            await resetPassword({
                user_email: formData.username,
                new_password: formData.newPassword
            }, token)

            // Simulate API call
            // await new Promise(resolve => setTimeout(resolve, 2000));

            setAlert({
                type: "success",
                message: "Password reset successfully!",
                show: true,
            });

            // Reset form on success
            setFormData({
                username: "",
                newPassword: "",
                confirmNewPassword: "",
            });

        } catch (error: any) {
            console.error("Error resetting password:", error);
            setAlert({
                type: "error",
                message: error?.message || "Failed to reset password. Please try again.",
                show: true,
            });
        } finally {
            setIsSubmitting(false);
        }

        // Hide alert after 3s
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    const renderField = (
        label: string,
        name: keyof ResetPasswordData,
        type: "text" | "password" = "text",
        placeholder: string = ""
    ) => {
        const hasError = !!errors[name];

        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} <span className="text-red-500">*</span>
                </label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${hasError
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                    placeholder={placeholder}
                />
                {hasError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[name]}
                    </p>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 ${className || ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Reset Password
                    </h2>
                </div>

                {alert.show && (
                    <div className="mb-6">
                        <div className={`p-4 rounded-md border ${alert.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {alert.type === 'success' ? (
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
                                    <p className={`text-sm font-medium ${alert.type === 'success'
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                        }`}>
                                        {alert.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {renderField("Username", "username", "text", "Enter your username")}
                    {renderField("New Password", "newPassword", "password", "Enter new password")}
                    {renderField("Confirm New Password", "confirmNewPassword", "password", "Confirm your new password")}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isSubmitting
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Resetting Password...</span>
                                </>
                            ) : (
                                <span>Reset Password</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirmation Popup Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Confirm Password Reset
                                </h3>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Are you sure you want to reset the password for <strong>{formData.username}</strong>?
                                This action cannot be undone and the user will need to use the new password to log in.
                            </p>
                        </div>

                        <div className="flex space-x-3 justify-end">
                            <button
                                type="button"
                                onClick={handleCancelConfirmation}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-md hover:shadow-lg"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResetPassword;