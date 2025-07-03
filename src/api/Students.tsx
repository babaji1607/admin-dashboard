import { GLOBAL_URL } from "../../utils";

interface ApiResponse {
    data?: any;
    status?: number;
}

interface ErrorResponse {
    status: number | null;
    message: string;
    data?: any;
    error?: any;
}

export const getAllStudents = async (
    offset: number,
    limit: number,
    token: string,
    onSuccess: (data: any) => void = () => { },
    onError: (error: ErrorResponse) => void = () => { }
): Promise<ApiResponse> => {
    try {
        const url = `${GLOBAL_URL}/students/showall?offset=${offset}&limit=${limit}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess(data);
        } else {
            onError({
                status: response.status,
                message: data?.detail || "Failed to fetch students",
                data
            });
        }

        return {
            data,
            status: response.status
        };
    } catch (e: any) {
        console.error("Error fetching students:", e);
        onError({
            status: null,
            message: e instanceof Error ? e.message : "Network error",
            error: e
        });
        return {};
    }
};

export const createStudent = async (
    token: string,
    studentData: any,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/students/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (response.ok) {
            onSuccess(data);
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Something went wrong',
                data
            });
        }
    } catch (error: any) {
        console.error("Error creating student:", error);
        onError({
            status: null,
            message: error instanceof Error ? error.message : 'Network error',
            error
        });
    }
};

export const updateStudent = async (
    token: string,
    studentId: string,
    updatedData: any,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/students/student/${studentId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (response.ok) {
            onSuccess(data);
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Something went wrong',
                data
            });
        }
    } catch (error: any) {
        console.error("Error updating student:", error);
        onError({
            status: null,
            message: error instanceof Error ? error.message : 'Network error',
            error
        });
    }
};

export const deleteStudent = async (
    token: string,
    studentId: string,
    onSuccess: (response: { message: string; status: number }) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/students/student/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            onSuccess({
                message: 'Student deleted successfully',
                status: response.status
            });
        } else {
            const data = await response.json();
            onError({
                status: response.status,
                message: data?.detail || 'Failed to delete student',
                data
            });
        }
    } catch (error: any) {
        onError({
            status: null,
            message: error instanceof Error ? error.message : 'Network error',
            error
        });
    }
};

/**
 * Search students by term using FastAPI endpoint.
 *
 * @param {string} searchTerm - The search term to query.
 * @returns {Promise<Array>} - Resolves to array of students.
 * @throws {Error} - Throws if request fails or no token is found.
 */
export async function searchStudents(searchTerm: string) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authorization token not found. Please log in.");
    }

    if (!searchTerm || typeof searchTerm !== "string") {
        throw new Error("Search term must be a non-empty string.");
    }

    const url = `${GLOBAL_URL}/students/search/by-term/?query=${encodeURIComponent(searchTerm)}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorDetails = "";
            try {
                const errorData = await response.json();
                errorDetails = errorData.detail || JSON.stringify(errorData);
            } catch {
                errorDetails = response.statusText;
            }

            throw new Error(`Error ${response.status}: ${errorDetails}`);
        }

        const data = await response.json();
        console.log("Students fetched", data);
        return data;

    } catch (error: any) {
        console.error("Failed to fetch students:", error);
        throw new Error(`Failed to fetch students: ${error.message}`);
    }
}
