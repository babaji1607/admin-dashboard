import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router"; // ✅ Correct package
import { getUserInfo } from "../../api/Auth";

interface UserInfo {
  name: string;
  email: string;
  image_url?: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    getUserInfo(token, (data: any) => {
      if (data?.detail === "Invalid token") {
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      setUser(data);
    });
  }, [navigate]);

  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img
            className="w-full h-full object-cover"
            src={user?.image_url || "https://avatar.iran.liara.run/public/50"}
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.name || "Admin"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email || "no-email@example.com"}
          </span>
        </div>

        <ul className="flex flex-col pt-3">
          <li>
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                signOut();
              }}
              tag="button"
              className="flex items-center w-full gap-3 px-3 py-2 font-medium text-red-600 rounded-lg group text-theme-sm hover:bg-red-50 dark:hover:bg-white/5"
            >
              <svg
                className="fill-red-600 group-hover:fill-red-800"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 21V3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign Out
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
