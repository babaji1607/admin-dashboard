import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { useEffect, useState, useCallback, useRef } from "react";
import { getAllStudents, deleteStudent, searchStudents } from "../../api/Students";
import { useNavigate } from "react-router";

interface Student {
    id: string;
    name: string;
    age: number;
    contact: string;
    address: string;
    class_id: string;
    user: {
        id: string;
        email: string;
    };
    FatherName: string;
    MotherName: string;
    FatherContact: string;
    MotherContact: string;
    notification_token: string;
    classroom: {
        id: string;
        name: string;
        teacher_id: string;
    };
    roll_number: number;
    date_of_birth: string;
}

export default function StudentTables() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState<Student[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchResultsRef = useRef<HTMLDivElement>(null);

    const handleStudentDelete = async (studentId: string) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('There is not token to process request')
                navigate('/')
                return
            }
            await deleteStudent(
                token,
                studentId,
                (data) => {
                    console.log('Student deleted successfully', data)
                    setTableData(prev => prev.filter(student => student.id !== studentId));
                },
                (error) => console.log('Something went wrong while deleting', error)
            )
        } catch (e) {
            console.log(e)
        }
    }

    const loadStudents = useCallback(async (page: number = 0, append: boolean = false) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);

        try {
            await new Promise<void>((resolve, reject) => {
                getAllStudents(
                    page,
                    pageSize,
                    token,
                    (data) => {
                        if (append) {
                            setTableData(prevData => [...prevData, ...data]);
                        } else {
                            setTableData(data);
                        }
                        setHasMore(data.length === pageSize);
                        setCurrentPage(page);
                        resolve();
                    },
                    (error: any) => {
                        console.log("error", error);
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error("Failed to load students:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, pageSize]);

    const handleLoadMore = useCallback(async () => {
        if (!isLoading && hasMore) {
            await loadStudents(currentPage + 1, true);
        }
    }, [currentPage, isLoading, hasMore, loadStudents]);

    const performSearch = useCallback(async (query: string) => {
        // Early return if query is too short
        if (!query.trim() || query.trim().length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            const data = await searchStudents(query);
            setSearchResults(data.slice(0, 10)); // Limit to 10 results
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Don't search if query is too short
        if (!value.trim() || value.trim().length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }

        // Show loading immediately for valid queries
        setIsSearching(true);
        setShowSearchResults(true);

        // Set new timeout for debouncing (500ms delay)
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

    const handleSearchResultClick = (student: Student) => {
        navigate("/student_form", { state: { ...student, isUpdate: true } });
        setShowSearchResults(false);
        setSearchQuery("");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        loadStudents(0, false);
    }, [loadStudents]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleRowClick = (row: Student) => {
        navigate("/student_form", { state: row });
    };

    return (
        <>
            <PageMeta
                title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Students" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate("/student_form")}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        <span className="text-lg">+</span>
                        <span>Create Student</span>
                    </button>

                    <div className="relative w-full sm:w-80">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search students by name, roll number..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white shadow-sm"
                                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {isSearching ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                ) : (
                                    <svg
                                        className="h-4 w-4 text-gray-400 dark:text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {showSearchResults && (
                            <div
                                ref={searchResultsRef}
                                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                            >
                                {searchResults.length > 0 ? (
                                    <div className="py-2">
                                        {searchResults.map((student) => (
                                            <div
                                                key={student.id}
                                                onClick={() => handleSearchResultClick(student)}
                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                                            Class: {student.classroom?.name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-4">
                                                        <span className="inline-flex dark:text-white items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100">
                                                            Roll No.: {student.roll_number}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.091m6.318-2.973C13.216 14.016 12.617 14 12 14s-1.216.016-1.727.118m.964 0A3 3 0 1012 13a3 3 0 00-.763.118z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {isSearching ? 'Searching...' : 'No students found'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {isSearching ? 'Please wait' : 'Try adjusting your search terms'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <ComponentCard title="Students data">
                    <BasicTableOne
                        rowData={tableData}
                        notificationChannel={'student'}
                        columns={[
                            { key: "id", header: "ID" },
                            { key: "name", header: "Name" },
                            { key: "contact", header: "Contact" },
                        ]}
                        onRowClick={handleRowClick}
                        deleteRow={handleStudentDelete}
                        onRowDeleted={(deletedRow) => setTableData(prev => prev.filter(student => student.id !== deletedRow.id))}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        onLoadMore={handleLoadMore}
                        initialDisplayCount={10}
                    />
                </ComponentCard>
            </div>
        </>
    );
}