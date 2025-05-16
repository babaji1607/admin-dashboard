import { GLOBAL_URL } from "../../utils";

export const getAllStudents = async (
    offset: number,
    limit: number,
    token: string,
    onSucess = (data: any) => { },
    onError = () => { }
) => {
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
            onSucess(data);
        } else {
            onError();
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.log(e);
        onError();
        return {};
    }
}


export const createStudent = async (token, studentData, onSuccess, onError) => {
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
            onSuccess(data); // success callback
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Something went wrong',
                data
            });
        }
        return
    } catch (error) {
        console.log("error", error);
        onError({
            status: null,
            message: error.message || 'Network error',
            error
        });
        return
    }
};


export const updateStudent = async (token, studentId, updatedData, onSuccess, onError) => {
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
            onSuccess(data); // success callback
        } else {
            onError({
                status: response.status,
                message: data?.detail || 'Something went wrong',
                data
            });
        }
    } catch (error) {
        console.log("error", error);
        onError({
            status: null,
            message: error.message || 'Network error',
            error
        });
    }
};

export const deleteStudent = async (token, studentId, onSuccess, onError) => {
    try {
        const response = await fetch(`${GLOBAL_URL}/students/student/${studentId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            // DELETE usually returns no content (204), so we don't need to parse JSON
            onSuccess({ message: 'Student deleted successfully', status: response.status });
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
            message: error.message || 'Network error',
            error
        });
    }
};


