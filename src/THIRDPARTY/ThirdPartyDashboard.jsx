import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import ThirdPartyHome from "./ThirdPartyHome";
import ThirdPartyMobile from "./Mobile/ThirdPartyMobile";
import Home from "./Home";

const ThirdPartyDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    isLoggedIn,
    setisLoggedIn,
  } = useStateContext();

  const [singleLog, setSingleLog] = useState(
    sessionStorage.getItem("userRole")
  );

  useEffect(() => {
    const currentThemeColor = sessionStorage.getItem("colorMode");
    const currentThemeMode = sessionStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  if (singleLog) {
    setisLoggedIn(singleLog);
  }



  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/thirdparty", { replace: true }); // Replace se back button par nahi jayega
    }
  }, []);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      {isLoggedIn == "thirdparty" && singleLog == "thirdparty" && (
        <>
        
        
         <Home/>
{/* <Mobile/> */}



       
    
        </>
      )}
    </div>
  );
};

export default ThirdPartyDashboard;
