import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Navbar, Footer, Sidebar, ThemeSettings } from "../components";
import ".././App.css";
import { useStateContext } from "../contexts/ContextProvider";
import { getAllStudent, teacherApi } from "./Api";
function TeacherDashboard() {
  const {
    setCurrentColor,
    numberOfStudent,
    setNumberOfStudent,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    isLoggedIn,
    setisLoggedIn,
    teacherData,
  } = useStateContext();

  const [singleLog, setSingleLog] = useState(
    sessionStorage.getItem("userRole")
  );

  if (singleLog) {
    setisLoggedIn(singleLog);
  }
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    try {
      teacherApi(email)
        .then((response) => {
          teacherData(response.data.data[0]);
        })
        .catch((error) => {
          console.log("first1", error);
        });
    } catch (error) {
      console.log("first", error);
    }

    try {
      getAllStudent()
        .then((response) => {
          setNumberOfStudent(response.data.allStudent.length);
        })
        .catch((error) => {
          console.error("Error fetching student count:", error);
        });
    } catch (error) {}

    try {
    } catch (error) {}
  }, []);

  useEffect(() => {
    const currentThemeColor = sessionStorage.getItem("colorMode");
    const currentThemeMode = sessionStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    };

    const handlePopstate = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      {isLoggedIn == "teacher" && singleLog == "teacher" && (
        <>
          <div className="flex relative dark:bg-main-dark-bg">
            <div className="fixed right-4 bottom-16" style={{ zIndex: "1000" }}>
              <TooltipComponent content="Settings" position="Top">
                <button
                  type="button"
                  onClick={() => setThemeSettings(true)}
                  style={{ background: currentColor, borderRadius: "50%" }}
                  className="text-3xl text-white p-1 hover:drop-shadow-xl hover:bg-light-gray"
                >
                  <FiSettings className="md:text-[14px] sm:text-[20px]"/>
                </button>
              </TooltipComponent>
            </div>
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                <Sidebar />
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg">
                <Sidebar />
              </div>
            )}
            <div
              className={
                activeMenu
                  ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
                  : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
              }
            >
              <div className="static  bg-main-bg dark:bg-main-dark-bg navbar w-full">

              {/* <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full "> */}
                <Navbar />
              </div>
              <div>
                {themeSettings && <ThemeSettings />}
                <Outlet />
              </div>
              {/* <div className="absolute   bottom-0 flex items-center">
                <Footer />
              </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherDashboard;
