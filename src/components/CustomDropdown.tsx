import React from "react";
import Select from "react-select";

export interface OptionType {
    label: string;
    value: string | number;
}

interface SelectDropdownProps {
    options: OptionType[];                      // Accept options as prop
    value?: OptionType | null;
    onChange: (option: OptionType | null) => void;
    placeholder?: string;
    isClearable?: boolean;
}

const CustomDropdown: React.FC<SelectDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    isClearable = false,
}) => {
    return (
        <div style={{ width: "100%" }}>
            <Select
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isClearable={isClearable}
                styles={{
                    container: (base) => ({
                        ...base,
                        width: "100%",
                    }),
                    control: (base) => ({
                        ...base,
                        width: "100%",
                    }),
                    menu: (base) => ({
                        ...base,
                        width: "100%",
                    }),
                }}
            />
        </div>
    );
};

export default CustomDropdown;
