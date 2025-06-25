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
    onSuccess: (data: any) => void = () => {},
    onError: () => void = () => {}
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
            onError();
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.error("Error fetching students:", e);
        onError();
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        onError({
            status: null,
            message: error instanceof Error ? error.message : 'Network error',
            error
        });
    }
};