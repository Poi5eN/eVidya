import React from "react";
import "./Loading.css";
import logo from "../src/ShikshMitraWebsite/digitalvidya.png";
const Loading = () => {
  return (
   
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  
    // <div className="flex justify-center items-center w-full bg-transparent ">
    //   <center className="mt-10 bg-transparent ">
    //     <br />
    //     <br />
    //     <br />
    //     <div class="loader" id="loader"></div>
    //     <div class="loader" id="loader2"></div>
    //     <div class="loader" id="loader3"></div>
    //     <div class="loader" id="loader4"></div>
    //     <span id="text">
    //       <img className="w-[150px] h-auto object-contain" src={logo} alt="" />
    //     </span>
    //     <br />
    //   </center>
    // </div>
  );
};

export default Loading;
