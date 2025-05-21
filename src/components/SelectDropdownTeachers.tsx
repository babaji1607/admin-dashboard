// SelectDropdownTeachers.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import { getAllTeachers } from '../api/Teachers';

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

interface Teacher {
  id: string | number;
  name: string;
}

const SelectDropdownTeachers: React.FC<FullWidthSelectProps> = ({
  value,
  onChange,
  placeholder = "Select...",
  isClearable = false,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);

  const fetchTeachers = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to sign-in");
      return;
    }

    getAllTeachers(
      0,
      100,
      token,
      (data: Teacher[]) => {
        const formattedOptions = data.map((teacher) => ({
          label: teacher.name,
          value: teacher.id,
        }));
        setOptions(formattedOptions);
      },
      (error: any) => {
        console.error("Error fetching teachers:", error);
      }
    );
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

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

export default SelectDropdownTeachers;
