
import React from "react";
import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const UserProfile = () => {
  const { currentColor } = useStateContext(); 
  const schoolImage = sessionStorage.getItem("schoolImage");
  const image = sessionStorage.getItem("image");
  const email = sessionStorage.getItem("email");
  const userRole = sessionStorage.getItem("userRole");
  const navigate = useNavigate();
  const handleLogout = () => {
    axios
      .get("https://eserver-i5sm.onrender.com/api/v1/logout")
      .then((response) => {
        sessionStorage.clear()
        localStorage.clear();
        navigate("/");
      })
      .catch((error) => {
        sessionStorage.clear()
      });
  };

  const schoolName = sessionStorage.getItem("schoolName");
  const schoolContact = sessionStorage.getItem("schoolContact");
  const schoolEmail = sessionStorage.getItem("schoolEmail");
  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D]  rounded-lg p-2">
      {userRole === "admin" ? null : (
        <>
          <div className="flex justify-between items-center">
            <p className="font-semibold text-[16px] dark:text-gray-200">
              School Profile
            </p>
            <Button
              icon={<MdOutlineCancel />}
              color="rgb(153, 171, 180)"
              bgHoverColor="light-gray"
              size="2xl"
              borderRadius="50%"
            />
          </div>
          <div className="flex gap-5 items-center mt-1 border-color border-b-1 pb-1">
            <img
              className="rounded-full h-20 w-20"
src={schoolImage}
              alt="user-profile"
            />
            <div>
              <p className="font-semibold text-lg dark:text-gray-200">
                {schoolName}
              </p>
              <p className="font-semibold text-sm dark:text-gray-200">
                {schoolContact}
              </p>
              <p className="font-semibold text-sm dark:text-gray-200">
                {schoolEmail}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between items-center">
        <p className="font-semibold text-[12px] dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="flex gap-5 items-center mt-1 border-color border-b-1 pb-1">
        <img
          className="rounded-full h-[30px] w-[30px]"
          src={image}
          alt="user-profile"
        />
        <div>
          <p className="font-semibold text-[16px] dark:text-gray-200">
            {schoolName}
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {userRole ? userRole.toUpperCase() : ""}
          </p>
          <p className="text-gray-500 text-[12px] font-semibold dark:text-gray-400">
            {email}
          </p>
        </div>
      </div>

      <div className="mt-1">
        <input
          type="button"
          value="Logout"
          onClick={handleLogout}
          style={{
            width: "100%",
            color: "white",
            backgroundColor: currentColor,
            borderRadius: "10px",
            cursor: "pointer",
            padding: "5px",
          }}
        />
      </div>
    </div>
  );
};

export default UserProfile;
