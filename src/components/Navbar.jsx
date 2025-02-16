import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { UserProfile } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import axios from "axios";
import "./style.css";
import Cookies from "js-cookie";
import { MdFullscreen } from "react-icons/md";
import { MdFullscreenExit } from "react-icons/md";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      />
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
    isFullScreen, setIsFullScreen
  } = useStateContext();

  const authToken = Cookies.get("token");
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "",
    role: "",
    schoolImage: "",
  });

  // const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // console.log("response",response)
        // localStorage.setItem("SchoolDetails",response.data)
        // const SchoolDetails = localStorage.getItem("SchoolDetails")
        // console.log("SchoolDetailsSchoolDetails",SchoolDetails)
        localStorage.setItem("SchoolDetails", JSON.stringify(response.data.admin));

        // Retrieve data from localStorage
        const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
        console.log("SchoolDetailsSchoolDetails", SchoolDetails)
        const schoolImage = response.data.admin.image.url;
        const schoolName = response.data.admin.schoolName;
        const role = response.data.admin.role;
        localStorage.setItem("schoolName", schoolName)
        sessionStorage.setItem("schoolName", schoolName);
        sessionStorage.setItem("schoolImage", schoolImage);
        setSchoolInfo({
          schoolName,
          role,
          schoolImage,
        });
      })
      .catch((error) => {
        console.error("Response error", error);
      });
  }, []);

  const fullName = sessionStorage.getItem("fullName");
  const image = sessionStorage.getItem("image");

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

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

  const schoolName = sessionStorage.getItem("schoolName");

  return (
    <div className="flex justify-between items-center relative bg-gray-100 dark:bg-main-dark-bg p-2">
    {/* Left: Menu Button */}
    <div className="flex items-center">
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenu />}
      />
    </div>

    {/* Center: Marquee and School Name */}
    <div className="flex-1 text-center  dark:text-white">
      <span className="text-[20px] font-semibold block" 
      style={{color:currentColor}}
      >
        {schoolName}
      </span>
      {/* <marquee
        className="html-marquee"
        direction="left"
        behavior="scroll"
        scrollamount="6"
      >
        <p
          style={{ color: currentColor, padding: "0px" }}
          className="text-[14px] whitespace-nowrap"
        >
          Technical Support and Query Helpline Numbers : +91 9650388201, +91
          8920377548, +91 7079771102 \ Email:corplyxtechnologies@gmail.com
        </p>
      </marquee> */}
    </div>

    {/* Right: Profile & Notification */}
      <div className="flex items-center gap-2">
      <div>
         <button
          onClick={toggleFullScreen}
          className="py-2"
          style={{ color: currentColor }}
         >
          {isFullScreen ? <MdFullscreenExit className="text-[30px]" title="Fullscreen Exit" /> : <MdFullscreen className="text-[30px]" title="full screen" />}
         </button>
      </div>
         <TooltipComponent content="Profile" position="BottomCenter">
            <div
                 className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-800"
              onClick={() => handleClick("userProfile")}
                >
                   <img
                        className="rounded-full w-[30px] h-[30px]"
                         src={image}
                      alt="user-profile"
                  />
                 <p className="text-black-400 font-semibold text-[16px] dark:text-white whitespace-nowrap hidden md:block">
                 {fullName}
                 </p>

                 <MdKeyboardArrowDown className="text-black-600 text-15 dark:bg-white" />
              </div>
          </TooltipComponent>
          {isClicked.userProfile && <UserProfile />}
       </div>
  </div>
    // <div className="flex justify-between relative bg-gray-100 dark:bg-main-dark-bg">
    //   <NavButton
    //     title="Menu"
    //     customFunc={handleActiveMenu}
    //     color={currentColor}
    //     icon={<AiOutlineMenu />}
    //   />
    //   <div className="w-full text-center dark:text-white">
    //     <span className=" text-[12px] font-semibold">
    //       {schoolName}
    //     </span>
    //     <marquee
    //       className="html-marquee"
    //       direction="left"
    //       behavior="scroll"
    //       scrollamount="6"
    //     >
    //       <p style={{ color: currentColor, padding: "0px" }} className="text-[14px]">
    //         Technical Support and Query Helpline Numbers : +91 9650388201, +91
    //         8920377548, +91 7079771102 \ Email:corplyxtechnologies@gmail.com
    //       </p>
    //     </marquee>
    //   </div>
    //   <div className=" flex item-center justify-center ">
    //     {/* <NavButton
    //       title="Notification"
    //       dotColor="rgb(254, 201, 15)"
    //       customFunc={() => handleClick("notification")}
    //       color={currentColor}
    //       icon={<RiNotification3Line />}
    //     /> */}
    //     <div>
    //       <button
    //         onClick={toggleFullScreen}
    //         className="py-2"
    //         style={{ color: currentColor }}
    //       >
    //         {isFullScreen ? <MdFullscreenExit className="text-[30px]" title="Fullscreen Exit" /> : <MdFullscreen className="text-[30px]" title="full screen" />}
    //       </button>
    //     </div>
    //     <TooltipComponent content="Profile" position="BottomCenter">

    //       <div
    //         className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-800"
    //         // className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-800 py-2 pr-4"
    //         onClick={() => handleClick("userProfile")}
    //       >
    //         <img
    //           className="rounded-full w-[30px] h-[30px]"
    //           src={image}
    //           alt="user-profile"
    //         />

    //         <p className="text-black-400 font-semibold  text-[16px] dark:text-white whitespace-nowrap hidden md:block">
    //           {fullName}
    //         </p>
    //         {/* </p> */}
    //         <MdKeyboardArrowDown className="text-black-600 text-15 dark:bg-white" />
    //       </div>
    //     </TooltipComponent>
        
    //     {isClicked.userProfile && <UserProfile />}
    //   </div>
    // </div>
  );
};

export default Navbar;



// import React, { useEffect, useState } from "react";
// import { AiOutlineMenu } from "react-icons/ai";
// import { RiNotification3Line } from "react-icons/ri";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { UserProfile } from ".";
// import { useStateContext } from "../contexts/ContextProvider";
// import axios from "axios";
// import "./style.css";
// import Cookies from "js-cookie";

// const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
//   <TooltipComponent content={title} position="BottomCenter">
//     <button
//       type="button"
//       onClick={() => customFunc()}
//       style={{ color }}
//       className="relative text-xl rounded-full p-3 hover:bg-light-gray"
//     >
//       <span
//         style={{ background: dotColor }}
//         className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
//       />
//       {icon}
//     </button>
//   </TooltipComponent>
// );

// const Navbar = () => {
//   const authToken = Cookies.get("token");
//   const [schoolInfo, setSchoolInfo] = useState({
//     schoolName: "",
//     role: "",
//     schoolImage: "",
//   });
//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdminInfo",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const schoolImage = response.data.admin.image.url;
//         const schoolName = response.data.admin.schoolName;
//         const schoolContact = response.data.admin.contact;
//         const schooladdress = response.data.admin.address;
//         const schoolEmail = response.data.admin.email;
//         // const schoolImage=response.data.admin.image?.url;
//         const role = response.data.admin.role;
//         //  console.log("NAvbar",response.data)
//         sessionStorage.setItem("schoolName", schoolName);
//         sessionStorage.setItem("schoolContact", schoolContact);
//         sessionStorage.setItem("schooladdress", schooladdress);
//         sessionStorage.setItem("schoolContact", schoolContact);
//         sessionStorage.setItem("schoolImage", schoolImage);
//         sessionStorage.setItem("schoolEmail", schoolEmail);
//         // console.log("schoolImage",schoolImage)
//         setSchoolInfo({
//           schoolName,
//           role,
//           schoolImage,
//         });
//       })

//       .catch((error) => {
//         console.error("Response error", error);
//       });
//   }, []);

//   const fullName = sessionStorage.getItem("fullName");
//   const image = sessionStorage.getItem("image");
//   const {
//     currentColor,
//     activeMenu,
//     setActiveMenu,
//     handleClick,
//     isClicked,
//     setScreenSize,
//     screenSize,
//   } = useStateContext();

//   useEffect(() => {
//     const handleResize = () => setScreenSize(window.innerWidth);

//     window.addEventListener("resize", handleResize);

//     handleResize();

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (screenSize <= 900) {
//       setActiveMenu(false);
//     } else {
//       setActiveMenu(true);
//     }
//   }, [screenSize]);

//   const handleActiveMenu = () => setActiveMenu(!activeMenu);

//   const schoolName = sessionStorage.getItem("schoolName");

//   return (
//     // <div className="fixed z-[99] mb-10 bg-gray-100 w-full">
//     <div className="flex justify-between relative  bg-gray-100 ">
//       {/* <div className="flex   justify-between  md:ml-6 md:mr-6 relative bg-yellow-400"> */}
//       <NavButton
//         title="Menu"
//         customFunc={handleActiveMenu}
//         color={currentColor}
//         icon={<AiOutlineMenu />}
//       />
//       <div className=" w-full text-center dark:text-white ">
//         {/* <div className=""> */}
//           <span className="md:text-xl sm:text-xs text-[10px]  font-semibold">
//             {schoolName}
//           </span>
//         {/* </div> */}

//         <marquee
//           className="html-marquee"
//           direction="left"
//           behavior="scroll"
//           scrollamount="6"
//         >
//           <p style={{ color: currentColor,padding:"0px" }}>
//             Technical Support and Query Helpline Numbers : +91 9650388201, +91
//             8920377548, +91 7079771102 \ Email:corplyxtechnologies@gmail.com
//           </p>
//         </marquee>
//       </div>
//       <div className="flex pr-5 bg-gray-100 ">
//         <NavButton
//           title="Notification"
//           dotColor="rgb(254, 201, 15)"
//           customFunc={() => handleClick("notification")}
//           color={currentColor}
//           icon={<RiNotification3Line />}
//         />
//         <TooltipComponent content="Profile" position="BottomCenter">
//           <div
//             className="flex  items-center gap-2 cursor-pointer  dark:hover:bg-gray-800 rounded-lg"
//             onClick={() => handleClick("userProfile")}
//           >
//             <img
//               className="rounded-full w-[20px] h-[20px]"
//               src={image}
//               alt="user-profile"
//             />
//             <p>
//               <span className="text-black-400 text-[10px] font-bold  dark:text-white ">
//                 Hi,
//               </span>{" "}
//               <span className="text-black-400 font-bold ml-1 text-[10px] dark:text-white">
//                 {fullName}
//               </span>
//             </p>
//             <MdKeyboardArrowDown className="text-black-600 text-15 dark:bg-white" />
//           </div>
//         </TooltipComponent>

//         {/* {isClicked.notification && <Notification />} */}
//         {isClicked.userProfile && <UserProfile />}
//       </div>
//     </div>
//     // </div>
//   );
// };

// export default Navbar;
