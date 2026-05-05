import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Dashboard from "./features/chat/pages/Dashboard";
import AdminLogin from "./features/admin/pages/AdminLogin";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminProtected from "./features/admin/components/AdminProtected";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/login/success",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/admin/login",
        element: <AdminLogin />
    },
    {
        path: "/admin/dashboard",
        element: <AdminProtected><AdminDashboard /></AdminProtected>
    },
    {
        path: "/",
        element: <Protected><Dashboard/></Protected>
    }
]);