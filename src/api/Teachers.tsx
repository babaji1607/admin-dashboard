import { GLOBAL_URL } from "../../utils";

export const getAllTeachers = async (
    offset: number,
    limit: number,
    token: string,
    onSucess = (data: any) => { },
    onError = () => { }
) => {
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


export const createTeacher = async (token, teacherData, onSuccess, onError) => {
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
            onSuccess(data); // success callback
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
            message: error.message || 'Network error',
            error
        });
    }
};

export const updateTeacher = async (token, teacherId, teacherData, onSuccess, onError) => {
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
            message: error.message || 'Network error',
            error
        });
    }
};


export const deleteTeacher = async (token, teacherId, onSuccess, onError) => {
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
            message: error.message || 'Network error',
            error
        });
    }
};

