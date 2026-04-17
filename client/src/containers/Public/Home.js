import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { Navigation, Search } from "./index";
import { Contact, Intro, Footer } from "../../components";
import { path } from "../../ultils/constant";
import bgLogin from "../../assets/bg-login.jpg";

const Home = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === `/${path.LOGIN}`;

  const navigate = useNavigate();

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#f9f4ee]">
        <Header />
        <main
          className="flex min-h-[calc(100vh-81px)] w-full items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 sm:py-8"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 249, 241, 0.72), rgba(255, 249, 241, 0.78)), url(${bgLogin})`,
          }}
        >
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_100%)]">
      <Header />
      <Navigation />
      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-6 lg:px-6">
        <Search />
        <Outlet />
        <Intro />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
