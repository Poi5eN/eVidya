// ViewProfile.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import Loading from "../../../Loading"
import SomthingwentWrong from "../../../SomthingwentWrong"
import useCustomQuery from "../../../useCustomQuery";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ViewPrimary = () => {
  const { currentColor } = useStateContext();
  const { _id } = useParams();
  const [classData, setClassData] = useState({});
  const {queryData:viewClass,loading:viewClassLoading,error:viewClassError} =useCustomQuery( `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getClass/${_id}`)
  
  useEffect(()=>{
    if(viewClass){
      setClassData(viewClass);
    }
},[viewClass])
  


  if(viewClassLoading){
    return <Loading/>
  }

  if(viewClassError){
    return <SomthingwentWrong/>
  }
  return (
    <>
     <Link to="/admin/classes">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            style={{ backgroundColor: currentColor, color: "white" }}
          >
            Back
          </Button>
        </Link>
      <div className=" w-full flex mg:h-screen h-[90vh] items-center justify-center pt-10 bg-gray-100">
     
        <div className=" rounded-md  sm:p-4 md:p-4 lg:p-4 p-2 pt-16  shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]   overflow-y-auto">
          <div className="w-[330px] h-[100%] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset] overflow-hidden">
            <h1 className="text-center mb-3 font-extrabold">
              {" "}
              Class DataTable
            </h1>

            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Class:</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[20px]">
                {" "}
                {/* {classData.className} */}
                {classData.class?.className}

          
              </span>
            </div>

            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Section:</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[20px]">
                {" "}
                {classData.class?.sections}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 w-full ">
              <h2 className="w-[100px]  text-[14px] ">Subject:</h2>
              <ul>
                {/* {classData.subjects ?.map((subject, index) => ( */}
                  <li
                   
                    className="font-semibold text-[#01a9ac]  text-[12px]"
                  >
                 
                  {classData.class?.subjects}
                  </li>
                {/* ))} */}
              </ul>
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPrimary;
