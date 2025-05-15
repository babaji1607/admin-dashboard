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
