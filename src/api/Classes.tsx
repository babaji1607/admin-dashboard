import { GLOBAL_URL } from "../../utils";

interface ErrorResponse {
    status: number | null;
    message: string;
    data?: any;
    error?: any;
}

export const createClassroom = async (
    token: string,
    classroomData: any,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/classrooms/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(classroomData)
        });

        if (response.ok) {
            const data = await response.json();
            onSuccess(data);
        } else {
            const errorData = await response.json();
            onError({
                status: response.status,
                message: errorData?.detail || 'Failed to create classroom',
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

export const getAllClassrooms = async (
    token: string,
    offset: number = 0,
    limit: number = 100,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const url = new URL(`${GLOBAL_URL}/classrooms/showall`);
        url.searchParams.append('offset', offset.toString());
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
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
                message: errorData?.detail || 'Failed to fetch classrooms',
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

export const deleteClassroom = async (
    token: string,
    classroomId: string,
    onSuccess: (data: any) => void,
    onError: (error: ErrorResponse) => void
): Promise<void> => {
    try {
        const url = `${GLOBAL_URL}/classrooms/classroom/${classroomId}`;

        const response = await fetch(url, {
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
                message: errorData?.detail || 'Failed to delete classroom',
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
