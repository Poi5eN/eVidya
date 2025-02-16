import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {

  const [isLoggedIn,setisLoggedIn] = useState("");
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor]  = useState('#1E4DB7');
  const [currentMode, setCurrentMode] = useState('Light');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [allstudentdata,setAllStudentData] = useState([]);
  const [teacherRoleData,setTeacherRoleData]=useState({});
  const [numberOfStudent,setNumberOfStudent]=useState(0);
  const [allFees,setAllFees]=useState()
   const [isFullScreen, setIsFullScreen] = useState(false);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    sessionStorage.setItem('themeMode', e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    sessionStorage.setItem('colorMode', color);
  };

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  const teacherData=(data)=>{
    setTeacherRoleData(data)
  }


  const toggleFullScreen = () => {
    if (!isFullScreen) {
      const element = document.documentElement; // Full screen for the entire app
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <StateContext.Provider value={{toggleFullScreen,isFullScreen, setIsFullScreen,numberOfStudent,setNumberOfStudent,teacherRoleData,teacherData, currentColor, currentMode, activeMenu, screenSize, setScreenSize, handleClick, isClicked, initialState, setIsClicked, setActiveMenu, setCurrentColor, setCurrentMode, setMode, setColor, themeSettings, setThemeSettings  , isLoggedIn , setisLoggedIn , setAllStudentData , allstudentdata,setAllFees,allFees  }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
