// FullWidthSelect.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import { getAllClassrooms } from '../api/Classes';

interface OptionType {
  label: string;
  value: string | number;
}

interface FullWidthSelectProps {
  value?: OptionType | null;
  onChange: (option: OptionType | null) => void;
  placeholder?: string;
  isClearable?: boolean;
}

interface Classroom {
  id: string | number;
  name: string;
}

const SelectDropdown: React.FC<FullWidthSelectProps> = ({
  value,
  onChange,
  placeholder = "Select...",
  isClearable = false,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);

  const fetchClassrooms = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to sign-in");
      return;
    }

    getAllClassrooms(
      token,
      0,
      100,
      (data: Classroom[]) => {
        const optionsData = data.map((classroom) => ({
          label: classroom.name,
          value: classroom.id,
        }));
        setOptions(optionsData);
      },
      (error: any) => {
        console.error("Error fetching classrooms:", error);
      }
    );
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  return (
    <div style={{ width: '100%' }}>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        styles={{
          container: (base) => ({ ...base, width: '100%' }),
          control: (base) => ({ ...base, width: '100%' }),
          menu: (base) => ({ ...base, width: '100%' }),
        }}
      />
    </div>
  );
};

export default SelectDropdown;
