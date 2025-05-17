// FullWidthSelect.tsx
import React, { useEffect } from 'react';
import Select from 'react-select';
import { getAllClassrooms } from '../api/Classes';

interface OptionType {
    label: string;
    value: string | number;
}

interface FullWidthSelectProps {
    // options: OptionType[];
    value?: OptionType | null;
    onChange: (option: OptionType | null) => void;
    placeholder?: string;
    isClearable?: boolean;
}

const SelectDropdown: React.FC<FullWidthSelectProps> = ({
    // options,
    value,
    onChange,
    placeholder = "Select...",
    isClearable = false,
}) => {

    const [options, setOptions] = React.useState<OptionType[]>([]);


    const fetchClassrooms = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            // navigate("/signin");
            console.error("No token found, redirecting to sign-in");
            return;
        }

        getAllClassrooms(
            token,
            0,
            100,
            (data) => {
                console.log("data", data);
                let optionsData = data.map(current => {
                    return {
                        label: current.name,
                        value: current.id
                    }
                })
                setOptions(optionsData)
            },
            (error) => {
                console.error("Error fetching classrooms:", error);
            }
        );
    };

    useEffect(() => {
        fetchClassrooms();
    }, [])

    return (
        <div style={{ width: '100%' }}>
            <Select
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isClearable={isClearable}
                styles={{
                    container: (base) => ({
                        ...base,
                        width: '100%',
                    }),
                    control: (base) => ({
                        ...base,
                        width: '100%',
                    }),
                    menu: (base) => ({
                        ...base,
                        width: '100%',
                    }),
                }}
            />
        </div>
    );
};

export default SelectDropdown;
