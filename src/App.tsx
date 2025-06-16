import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import ScrollToTop from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
// import BasicTables from "./pages/Tables/BasicTables";
import TeacherTable from "./pages/Tables/TeacherTable"
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Home from "./pages/Dashboard/Home";
import StudentTables from "./pages/Tables/StudentTables";
import { ReactNode } from "react";
import FeeReceipts from "./pages/Tables/FeeReceipts";
import NotificationHistory from "./pages/Tables/NotificationHistory";
import AttendanceTable from "./pages/Tables/AttendanceTable";
import StudentForm from "./pages/StudentForm";
import TeacherForm from "./pages/TeacherForm";
import ClassroomTable from "./pages/Tables/ClassroomTable";
import ClassroomForm from "./pages/ClassroomForm";

// ✅ Simple ProtectedRoute component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/signin" element={<SignIn />} />

        {/* Protected Routes */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route element={<AppLayout />}>
                  {/* <Route index path="/" element={<Home />} /> */}
                  <Route path="/profile" element={<UserProfiles />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/blank" element={<Blank />} />
                  <Route path="/form-elements" element={<FormElements />} />
                  <Route path="/teacher-tables" element={<TeacherTable />} />
                  {/* <Route path="/classroom-tables" element={<ClassroomTable />} /> */}
                  <Route path="/" element={<ClassroomTable />} />
                  <Route path="/student-tables" element={<StudentTables />} />
                  <Route path="/fee-receipts" element={<FeeReceipts />} />
                  <Route path="/notification-history" element={<NotificationHistory />} />
                  <Route path="/attendance" element={<AttendanceTable />} />
                  <Route path="/student_form" element={<StudentForm />} />
                  <Route path="/teacher_form" element={<TeacherForm />} />
                  <Route path="/classroom_form" element={<ClassroomForm />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/avatars" element={<Avatars />} />
                  <Route path="/badge" element={<Badges />} />
                  <Route path="/buttons" element={<Buttons />} />
                  <Route path="/images" element={<Images />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/line-chart" element={<LineChart />} />
                  <Route path="/bar-chart" element={<BarChart />} />
                </Route>

                {/* If no matching route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
