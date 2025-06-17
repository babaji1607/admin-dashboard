import { GLOBAL_URL } from "../../utils";

// Solution 1: Make callback functions optional
export const getAttendanceSessions = async (
    page: number,
    limit: number,
    token: string,
    class_name?: string,
    date?: string,            // Expected in 'YYYY-MM-DD' format
    teacher_id?: string,
    onSuccess?: (data: any) => void,
    onError?: (data: any) => void
): Promise<{ data?: any; status?: number }> => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (class_name) queryParams.append("class_name", class_name);
        if (date) queryParams.append("date", date);
        if (teacher_id) queryParams.append("teacher_id", teacher_id);

        const url = `${GLOBAL_URL}/attendance/sessions/?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess?.(data);
        }

        return {
            data,
            status: response.status,
        };
    } catch (e) {
        console.error("Error fetching attendance sessions:", e);
        onError?.(e);
        return {};
    }
};

// Solution 2: Move required callbacks before optional parameters
export const getAttendanceSessionsAlt = async (
    page: number,
    limit: number,
    token: string,
    onSuccess: (data: any) => void,
    onError: (data: any) => void,
    class_name?: string,
    date?: string,            // Expected in 'YYYY-MM-DD' format
    teacher_id?: string
): Promise<{ data?: any; status?: number }> => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (class_name) queryParams.append("class_name", class_name);
        if (date) queryParams.append("date", date);
        if (teacher_id) queryParams.append("teacher_id", teacher_id);

        const url = `${GLOBAL_URL}/attendance/sessions/?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess(data);
        }

        return {
            data,
            status: response.status,
        };
    } catch (e) {
        console.error("Error fetching attendance sessions:", e);
        onError(e);
        return {};
    }
};

// Solution 3: Use an options object (Recommended for many parameters)
interface AttendanceSessionsOptions {
    class_name?: string;
    date?: string;
    teacher_id?: string;
    onSuccess?: (data: any) => void;
    onError?: (data: any) => void;
}

export const getAttendanceSessionsWithOptions = async (
    page: number,
    limit: number,
    token: string,
    options: AttendanceSessionsOptions = {}
): Promise<{ data?: any; status?: number }> => {
    const { class_name, date, teacher_id, onSuccess, onError } = options;

    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (class_name) queryParams.append("class_name", class_name);
        if (date) queryParams.append("date", date);
        if (teacher_id) queryParams.append("teacher_id", teacher_id);

        const url = `${GLOBAL_URL}/attendance/sessions/?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess?.(data);
        }

        return {
            data,
            status: response.status,
        };
    } catch (e) {
        console.error("Error fetching attendance sessions:", e);
        onError?.(e);
        return {};
    }
};