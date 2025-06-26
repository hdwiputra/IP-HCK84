import { Outlet } from "react-router";
import Header from "../components/headers";
import SimpleFooter from "../components/SimpleFooter";
// Import Footer when you create it
// import Footer from "../components/Footer";

export default function PubLayout() {
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
