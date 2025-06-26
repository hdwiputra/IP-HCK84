import { Outlet, useNavigate } from "react-router";
import Header from "../components/headers";
import SimpleFooter from "../components/SimpleFooter";
import { useEffect } from "react";
import Swal from "sweetalert2";
// Import Footer when you create it
// import Footer from "../components/Footer";

export default function MainLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        title: "error",
        text: "You have not login",
        icon: "error",
      });
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <SimpleFooter />
    </>
  );
}
