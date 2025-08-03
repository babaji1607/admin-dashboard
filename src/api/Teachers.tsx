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

export const getAllTeachers = async (
    offset: number,
    limit: number,
    token: string,
    onSuccess: (data: any) => void = () => { },
    onError: (data: any) => void = () => { }
): Promise<ApiResponse> => {
    try {
        const url = `${GLOBAL_URL}/teachers/showall?offset=${offset}&limit=${limit}`;

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
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.error("Error fetching teachers:", e);
        onError(e);
        return {};
    }
};

export const createTeacher = async (
    token: string,
    teacherData: any,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/teachers/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            body: JSON.stringify(teacherData)
        });

        const data = await response.json();

        if (response.ok) {
            onSuccess(data);
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Failed to create teacher',
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

export const updateTeacher = async (
    token: string,
    teacherId: string,
    teacherData: any,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/teachers/teacher/${teacherId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            },
            body: JSON.stringify(teacherData)
        });

        const data = await response.json();

        if (response.ok) {
            onSuccess(data);
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Failed to update teacher',
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

export const deleteTeacher = async (
    token: string,
    teacherId: string,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/teachers/teacher/${teacherId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            onSuccess(data);
        } else {
            const errorData = await response.json();
            onError({
                status: response.status,
                message: errorData?.detail || 'Failed to delete teacher',
                data: errorData
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