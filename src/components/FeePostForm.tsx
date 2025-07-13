import { useState } from "react";
import { createFeePost } from "../api/Feepost";

// Define interface for fee key-value pairs
interface FeeItem {
    id: string;
    fee_type: string;
    fee_amount: string;
}

// Define interface for additional form
interface AdditionalFormData {
    title: string;
    other_fee: FeeItem[];
    deadline: string;
    is_paid: boolean;
    mode: "online" | "offline";
}

interface AdditionalFormProps {
    onSubmit?: (payload: any) => void;
    className?: string;
    student_id: string;
}

const AdditionalForm: React.FC<AdditionalFormProps> = ({
    onSubmit,
    className,
    student_id,
}) => {
    const [formData, setFormData] = useState<AdditionalFormData>({
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

    const handleFormChange = (field: keyof AdditionalFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFeeItemChange = (id: string, field: keyof FeeItem, value: string) => {
        setFormData(prev => ({
            ...prev,
            other_fee: prev.other_fee.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addFeeItem = () => {
        const newId = Date.now().toString();
        setFormData(prev => ({
            ...prev,
            other_fee: [...prev.other_fee, { id: newId, fee_type: "", fee_amount: "" }]
        }));
    };

    const removeFeeItem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            other_fee: prev.other_fee.filter(item => item.id !== id)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otherFeeObject = formData.other_fee.reduce((acc, item) => {
            if (item.fee_type && item.fee_amount) {
                acc[item.fee_type] = Number(item.fee_amount); // ensure numeric
            }
            return acc;
        }, {} as Record<string, number>);

        const payload = {
            title: formData.title,
            other_fee: otherFeeObject,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : "",
            is_paid: formData.is_paid,
            mode: formData.mode,
            student_id: student_id
        };

        try {
            const response = await createFeePost(payload, "your-auth-token-here"); // replace with actual token logic

            if (response.success) {
                setAlert({
                    type: "success",
                    message: "Additional form submitted successfully.",
                    show: true,
                });

                // ✅ Reset form fields after successful submission
                setFormData({
                    title: "",
                    other_fee: [{ id: "1", fee_type: "", fee_amount: "" }],
                    deadline: "",
                    is_paid: false,
                    mode: "online",
                });

                // Optional: callback to parent
                if (onSubmit) {
                    onSubmit(payload);
                }
            } else {
                setAlert({
                    type: "error",
                    message: response.message || "Failed to submit fee post.",
                    show: true,
                });
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: "Something went wrong while submitting.",
                show: true,
            });
        }

        // Hide alert after 3s
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Send fee Post
                </h2>
            </div>

            {alert.show && (
                <div className="mb-6">
                    <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Field */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFormChange("title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter title"
                    />
                </div>

                {/* Other Fee Field */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Other Fees
                    </label>
                    <div className="space-y-3 bg-gray-50 dark:bg-blue-950 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                        {formData.other_fee.map((feeItem, index) => (
                            <div key={feeItem.id} className="flex gap-3 items-center">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={feeItem.fee_type}
                                        onChange={(e) => handleFeeItemChange(feeItem.id, "fee_type", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Fee type"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={feeItem.fee_amount}
                                        onChange={(e) => handleFeeItemChange(feeItem.id, "fee_amount", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Fee amount"
                                    />
                                </div>
                                {formData.other_fee.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeFeeItem(feeItem.id)}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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
                        Deadline
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => handleFormChange("deadline", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                                checked={formData.is_paid}
                                onChange={(e) => handleFormChange("is_paid", e.target.checked)}
                                className="sr-only"
                            />
                            <div
                                onClick={() => handleFormChange("is_paid", !formData.is_paid)}
                                className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${formData.is_paid ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 relative top-1 rounded-full bg-white shadow-md transform transition-transform ${formData.is_paid ? "translate-x-6" : "translate-x-1"
                                        } mt-1`}
                                />
                            </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.is_paid ? "Paid" : "Unpaid"}
                        </span>
                    </div>
                </div>

                {/* Mode Field */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mode
                    </label>
                    <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="online"
                                checked={formData.mode === "online"}
                                onChange={(e) => handleFormChange("mode", e.target.value as "online" | "offline")}
                                className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Online</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="offline"
                                checked={formData.mode === "offline"}
                                onChange={(e) => handleFormChange("mode", e.target.value as "online" | "offline")}
                                className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Offline</span>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                    >
                        Submit Additional Information
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdditionalForm;