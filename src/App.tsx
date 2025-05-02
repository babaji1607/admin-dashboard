import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useUser, ClerkProvider, SignedOut } from "@clerk/clerk-react";
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
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Home from "./pages/Dashboard/Home";
import StudentTables from "./pages/Tables/StudentTables";

// ✅ Simple ProtectedRoute component
function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!isSignedIn) {
    return <Navigate to="/signin" />;
  }

  return children;
}

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
                  <Route index path="/" element={<Home />} />
                  <Route path="/profile" element={<UserProfiles />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/blank" element={<Blank />} />
                  <Route path="/form-elements" element={<FormElements />} />
                  <Route path="/teacher-tables" element={<BasicTables />} />
                  <Route path="/student-tables" element={<StudentTables />} />
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
