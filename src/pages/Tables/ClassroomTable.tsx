import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
// import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import BasicTableForClass from "../../components/tables/BasicTables/BasicTableForClass";
import { getAllClassrooms, deleteClassroom, createClassroom } from "../../api/Classes";
import { v4 as generateUUID } from "uuid";
import SelectDropdownTeachers from "../../components/SelectDropdownTeachers";

interface OptionType {
    label: string;
    value: string | number;
}

interface Classroom {
    id: string;
    name: string;
    teacher_id: string;
    // add other classroom properties here if needed
}

interface NotificationStatus {
    show: boolean;
    success: boolean;
    message: string;
}

interface ClassCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: { name: string; teacher_id: string }) => void;
}

const ClassCreationModal: React.FC<ClassCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<{ name: string; teacher_id: string }>({
        name: "",
        teacher_id: generateUUID(), // Temporary UUID
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [selectedTeacher, setSelectedTeacher] = useState<OptionType | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTeacherChange = (option: OptionType | null) => {
        setSelectedTeacher(option);
        setFormData((prev) => ({
            ...prev,
            teacher_id: option ? option.value.toString() : "",
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        onSubmit(formData);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-white">Create New Class</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="p-4 mx-5 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-5">
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-2.5 block font-medium text-gray-700 dark:text-white">
                            Class Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter class name (e.g., KG, Grade 1)"
                            className="w-full dark:text-white text-black rounded-lg border border-gray-200 bg-transparent px-5 py-3 text-theme-sm font-medium outline-none transition focus:border-blue-500 active:border-blue-500 disabled:cursor-default dark:border-white/[0.05] dark:bg-white/[0.03] dark:focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="teacher_id" className="mb-2.5 block font-medium text-gray-700 dark:text-white">
                            Teacher ID
                        </label>
                        <SelectDropdownTeachers
                            value={selectedTeacher}
                            onChange={handleTeacherChange}
                            placeholder="Select teacher..."
                            isClearable={true}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            A temporary teacher ID is generated automatically
                        </p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors duration-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Create Class
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClassroomTable: React.FC = () => {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState<Classroom[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isLoading, setIsLoading] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>({
        show: false,
        success: false,
        message: "",
    });

    const fetchClassrooms = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        getAllClassrooms(
            token,
            0,
            10,
            (data: Classroom[]) => {
                setTableData(data);
            },
            (error) => {
                console.error("Error fetching classrooms:", error);
            }
        );
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const handleRowClick = (row: Classroom) => {
        navigate("/classroom_form", { state: row });
    };

    const handleCreateClass = (formData: { name: string; teacher_id: string }) => {
        // setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            // setIsLoading(false);
            navigate("/signin");
            return;
        }

        createClassroom(
            token,
            formData,
            () => {
                // setIsLoading(false);
                setIsModalOpen(false);
                setNotificationStatus({
                    show: true,
                    success: true,
                    message: "Class created successfully!",
                });

                setTimeout(() => {
                    setNotificationStatus({ show: false, success: false, message: "" });
                }, 2000);

                fetchClassrooms();
            },
            (error) => {
                // setIsLoading(false);
                setNotificationStatus({
                    show: true,
                    success: false,
                    message: `Error creating class: ${error.message}`,
                });

                setTimeout(() => {
                    setNotificationStatus({ show: false, success: false, message: "" });
                }, 2000);
            }
        );
    };

    const handleDeleteClassroom = (id: string) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        deleteClassroom(
            token,
            id,
            () => {
                fetchClassrooms();
            },
            (error) => {
                setNotificationStatus({
                    show: true,
                    success: false,
                    message: `Error deleting classroom: ${error.message}`,
                });

                setTimeout(() => {
                    setNotificationStatus({ show: false, success: false, message: "" });
                }, 2000);
            }
        );
    };

    // Prepare data for BasicTableOne
    const columns = [
        { key: "name", header: "Class Name" },
        { key: "teacher_id", header: "Teacher ID" },
        {
            key: "actions",
            header: "Actions",
            render: (row: Classroom) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClassroom(row.id);
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    aria-label={`Delete class ${row.name}`}
                >
                    Delete
                </button>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="Classroom Table" description="Classroom Table" />
            <PageBreadcrumb
                pageTitle="Classrooms"
            // breadcrumbItems={[{ label: "Home", link: "/" }, { label: "Classrooms" }]}
            />

            {notificationStatus.show && (
                <div
                    className={`fixed top-4 right-4 z-50 rounded-lg p-4 text-white ${notificationStatus.success ? "bg-green-600" : "bg-red-600"
                        }`}
                >
                    {notificationStatus.message}
                </div>
            )}

            <ComponentCard title="Classroom Table">
                <div className="mb-4 flex justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Create New Class
                    </button>
                </div>

                <BasicTableForClass
                    columns={columns}
                    rowData={tableData}
                    onRowClick={handleRowClick}
                    notificationChannel=""
                />
            </ComponentCard>

            <ClassCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateClass}
            />
        </>
    );
};

export default ClassroomTable;
