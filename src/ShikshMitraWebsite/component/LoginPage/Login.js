import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../digitalvidya.png'
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import { FaUser } from "react-icons/fa";
import LoadingComp from '../../../Loading';


const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formdata, setFormdata] = useState({
        Username: '',
        Password: '',
        Role: 'accountants',
        session: ''  // Added session state
    });
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);

    const Navigate = useNavigate();

    const showSuccessToast = (message) => {
        toast.success(message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
        });
    };

    const showErrorToast = (message) => {
        toast.error(message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormdata(prev => ({ ...prev, [name]: value }));

        // Show/hide session dropdown based on role
        if (name === 'Role') {
            setShowSessionDropdown(value === 'admin');
            // Reset session value when switching away from admin
            if (value !== 'admin') {
                setFormdata(prev => ({ ...prev, session: '' }));
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsClosed(true);
        setLoading(true);

        try {
            let payload = {
                email: formdata.Username,
                password: formdata.Password,
                role: formdata.Role,
            };

            // Add session to payload only if role is admin and session is selected
            if (formdata.Role === 'admin' && formdata.session) {
                payload.session = formdata.session;
            }

            sessionStorage.setItem("userRole", formdata.Role);
            const response = await axios.post("https://eserver-i5sm.onrender.com/api/v1/login", payload);
            console.log("response",response)
            setisLoggedIn(formdata.Role);
            localStorage.setItem("userData",response?.data?.token)
            Cookies.set("token", response?.data?.token, { expires: 2 });
            const fullName = response?.data?.user?.fullName;
            const image = response?.data?.user?.image?.url;
            const email = response?.data?.user?.email;
            sessionStorage.setItem("fullName", fullName);
            sessionStorage.setItem("image", image);
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("response", JSON.stringify(response.data.user));

            const token = response.data.token
            Cookies.set("token", token, { expires: 1, path: '/' });
            showSuccessToast("Login successful!!!");
            Navigate(`/${formdata.Role}`);

        } catch (error) {
            console.error("Login Error:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                showErrorToast(`Login failed: ${error.response.data.message || "Invalid credentials"}`);
            } else if (error.request) {
                console.error("No response received:", error.request);
                showErrorToast("Login failed: No response from server.");
            } else {
                showErrorToast("Login failed: An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
            setIsClosed(false);
        }
    };
    const clickPassword = () => {
        setShowPassword((prev) => !prev);
    };
   
    if(loading){
      return  <LoadingComp/>
    }
    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
                <div className=" grid md:grid-cols-5 overflow-hidden  w-full mx-auto p-4 md:p-0">
                    <div
                     className="w-full md:col-span-3 h-[100vh] hidden md:block relative overflow-hidden sm-hidden"
                    //  className="w-full md:w-1/2 h-[100vh] hidden md:block relative overflow-hidden sm-hidden"
                     >
                        <div className="absolute top-0 left-0 w-1/2 h-8 bg-gradient-to-r from-[#3a9ede] to-[#f05c28] rounded-br-xl">
                        </div>
                        <div className="absolute bottom-0 right-0 w-1/2 h-8 bg-gradient-to-r from-[#f05c28] to-[#3a9ede]  rounded-tl-xl">
                        </div>
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative h-44   overflow-hidden mb-4">
                                <img
                                    src={logo}
                                    alt="TechInnovation Logo"
                                    className="object-cover"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-[#3a9ede] text-center leading-tight">
                                Vidyalaya  <span className="text-[#f05c28]">MANAGEMENT</span> SOFTWARE
                            </h1>
                        </div>
                    </div>
                    <div 
                    className="w-full md:col-span-2 md:p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
                    // className="w-full md:w-1/3 p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
                    >
                        <div className="flex justify-center ">
                            <div >
                                <img
                                    src={logo}
                                    alt="TechInnovation Logo"
                                    // className="object-cover"
                                     className="object-cover h-24 "
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 text-center md:text-left">
                            Welcome to <span className="text-red-500">DigitalVidyaSaarthi                                                  </span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-2 text-center md:text-left mb-6">
                            "Efficiency, Transparency, Growth. simple
                            "Innovate, Automate, Educate with ease" "A great Saarthi resolves all problems."
                        </p>

                        <div className="mt-4 w-full">
                            <h3 className="text-lg font-semibold text-gray-700 text-center md:text-left mb-2">
                                Vidyaalay  <span className="text-red-500">ERP</span> <span className="text-[#3a9ede]">ADMIN</span> LOGIN
                            </h3>
                            <div className="">
                                <div className="mb-4">
                                    <select
                                        className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                                        value={formdata.Role}
                                        onChange={handleChange}
                                        name="Role"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="accountants">Accountant</option>
                                        <option value="student">Student</option>
                                        <option value="parent">Parent</option>
                                        <option value="thirdparty">Thirdparty</option>
                                    </select>
                                </div>

                                {showSessionDropdown && (
                                    <div className="mb-4">
                                        <select
                                            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                                            value={formdata.session}
                                            onChange={handleChange}
                                            name="session"
                                        >
                                            {/* <option value="">Select Session</option> */}
                                            <option value="2023-2024">2023-2024</option>
                                            <option value="2024-2025">2024-2025</option>
                                        </select>
                                    </div>
                                )}

                                <div className="mb-4 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                        <FaUser />
                                    </span>
                                    <input
                                        name="Username"
                                        value={formdata.Username}
                                        onChange={handleChange}
                                        disabled={isClosed}
                                        type="text"
                                        placeholder="Enter Your Userid"
                                        className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
                                    />
                                </div>
                                <div className="mb-4 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                        <FaUser />
                                    </span>
                                    <input
                                        name="Password"
                                        value={formdata.Password}
                                        onChange={handleChange}
                                        disabled={isClosed}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Your Password"
                                        className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
                                    />
                                    <span
                                        onClick={clickPassword}
                                        className="text-2xl text-gray-600 absolute right-3 top-[10px] cursor-pointer"
                                    >
                                        {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    onClick={submitHandler}
                                    className="w-full py-2 rounded-md bg-gradient-to-r from-[#f0592e] to-[#f0592c] text-white font-semibold hover:from-[#3a9ede] hover:to-[#3a9ede] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                >
                                    {loading ? 'Logging In...' : 'LOGIN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;




// import React, { useState } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import logo from '../../digitalvidya.png'
// import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
// import { FaUser } from "react-icons/fa";
// const Login = () => {
//     const [showPassword, setShowPassword] = useState(false);
   
//     const [formdata, setFormdata] = useState({
//         Username: '',
//         Password: '',
//         Role: 'accountants',
//     });
//     const [loading, setLoading] = useState(false);
//     const [isClosed, setIsClosed] = useState(false);
//     const [isLoggedIn, setisLoggedIn] = useState(false);

//     const Navigate = useNavigate();

//     const showSuccessToast = (message) => {
//         toast.success(message, {
//             position: toast.POSITION.TOP_CENTER,
//             autoClose: 2000,
//         });
//     };

//     const showErrorToast = (message) => {
//         toast.error(message, {
//             position: toast.POSITION.TOP_CENTER,
//             autoClose: 2000,
//         });
//     };

//     const handleChange = (e) => {
//         console.log(`Input Name: ${e.target.name}, Value: ${e.target.value}`); // Debugging line
//         setFormdata({ ...formdata, [e.target.name]: e.target.value });
//     };

//     const submitHandler = async (e) => {
//         e.preventDefault();
//         setIsClosed(true);
//         setLoading(true);
// // debugger
//         try {
//             const payload = {
//                 email: formdata.Username,
//                 password: formdata.Password,
//                 role: formdata.Role,
//             };

//             sessionStorage.setItem("userRole", formdata.Role);
//             const response = await axios.post("https://eserver-i5sm.onrender.com/api/v1/login", payload);
//             console.log("response",response)
//             setisLoggedIn(formdata.Role);
//             Cookies.set("token", response?.data?.token, { expires: 2 });
//             const fullName = response?.data?.user?.fullName;
//             const image = response?.data?.user?.image?.url;
//             const email = response?.data?.user?.email;
//             sessionStorage.setItem("fullName", fullName);
//             sessionStorage.setItem("image", image);
//             sessionStorage.setItem("email", email);
//             sessionStorage.setItem("response", JSON.stringify(response.data.user));

//             // document.cookie = `token=${token}; path=/; max-age=86400`;
//             const token = response.data.token
//             Cookies.set("token", token, { expires: 1, path: '/' });
//             showSuccessToast("Login successful!!!");
//             // Navigate(`/thirdparty`);
//             Navigate(`/${formdata.Role}`);

//         } catch (error) {
//             console.error("Login Error:", error);
//             if (error.response) {
//                 console.error("Response data:", error.response.data);  // Log response data
//                 console.error("Response status:", error.response.status); // Log status code
//                 showErrorToast(`Login failed: ${error.response.data.message || "Invalid credentials"}`); // Show backend message if available
//             } else if (error.request) {
//                 console.error("No response received:", error.request);
//                 showErrorToast("Login failed: No response from server.");
//             } else {
//                 showErrorToast("Login failed: An unexpected error occurred.");
//             }
//         } finally {
//             setLoading(false);
//             setIsClosed(false);
//         }
//     };
//     const clickPassword = () => {
//         setShowPassword((prev) => !prev);
//     };

//     return (
//         <>
//                          <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
//     <div className="  overflow-hidden  w-full mx-auto p-4 md:p-0 flex">


//         <div className="w-full md:w-1/2 h-[100vh] hidden md:block relative overflow-hidden sm-hidden">
//             <div className="absolute top-0 left-0 w-1/2 h-8 bg-gradient-to-r from-[#3a9ede] to-[#f05c28] rounded-br-xl">
//             </div>
//             <div className="absolute bottom-0 right-0 w-1/2 h-8 bg-gradient-to-r from-[#f05c28] to-[#3a9ede]  rounded-tl-xl">
//             </div>

//             <div className="flex flex-col items-center justify-center h-full">
//                 <div className="relative h-44   overflow-hidden mb-4">
//                     <img
//                         src={logo}
//                         alt="TechInnovation Logo"
//                         className="object-cover"
//                     />
//                 </div>
//                 <h1 className="text-3xl font-bold text-[#3a9ede] text-center leading-tight">
//                     Vidyalaya  <span className="text-[#f05c28]">MANAGEMENT</span> SOFTWARE
//                 </h1>
//             </div>


//         </div>
//         <div className="w-full md:w-1/3 p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center">  {/* Added flex and centering classes */}
//             <div className="flex justify-center mb-6">
//                 <div 
//                 // className="relative md:h-28  h-full overflow-hidden"
//                 >
//                     <img
//                         src={logo}
//                         alt="TechInnovation Logo"
//                         className="object-cover"
//                     />
//                 </div>
//             </div>

//             <h2 className="text-2xl font-semibold text-gray-800 text-center md:text-left">
//                 Welcome to <span className="text-red-500">DigitalVidyaSaarthi                                                  </span>
//             </h2>
//             <p className="text-sm text-gray-600 mt-2 text-center md:text-left mb-6">
//                 "Efficiency, Transparency, Growth. simple
//                 "Innovate, Automate, Educate with ease" "A great Saarthi resolves all problems."
//             </p>

//             <div className="mt-4 w-full"> {/*  Added w-full to make the form take full width */}
//                 <h3 className="text-lg font-semibold text-gray-700 text-center md:text-left mb-2">
//                     Vidyaalay  <span className="text-red-500">ERP</span> <span className="text-[#3a9ede]">ADMIN</span> LOGIN
//                 </h3>


//                 <div className="">
//                     <div className="mb-4">
//                         <select
                            
//                             className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
//                             value={formdata.Role}
//                             onChange={handleChange}
//                             name="Role"
//                         >
//                             <option value="admin">Admin</option>
//                             <option value="teacher">Teacher</option>
//                             <option value="receptionist">Receptionist</option>
//                             <option value="accountants">Accountant</option>
//                             <option value="student">Student</option>
//                             <option value="parent">Parent</option>
//                             <option value="thirdparty">Thirdparty</option>
//                         </select>
//                     </div>

//                     <div className="mb-4 relative">
//                         <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">

//                             <FaUser />
//                         </span>
//                         <input
//                             name="Username"
//                             value={formdata.Username}
//                             onChange={handleChange}
//                             disabled={isClosed}
//                             type="text"
//                             placeholder="Enter Your Userid"
//                             className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
//                         />
//                     </div>
//                     <div className="mb-4 relative">
//                         <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">

//                             <FaUser />
//                         </span>
//                         <input
//                             name="Password"
//                             value={formdata.Password}
//                             onChange={handleChange}
//                             disabled={isClosed}
//                             // type="text"
//                             type={showPassword ? 'text' : 'password'}
//                             placeholder="Enter Your Password"
//                             className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
//                         />
//                         <span
//                             onClick={clickPassword}
//                             className="text-2xl text-gray-600 absolute right-3 top-[10px] cursor-pointer"
//                         >
//                             {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
//                         </span>
//                     </div>

//                     <button
//                         type="submit"
//                         onClick={submitHandler}
//                         className="w-full py-2 rounded-md bg-gradient-to-r from-[#f0592e] to-[#f0592c] text-white font-semibold hover:from-[#3a9ede] hover:to-[#3a9ede] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
//                     >
//                         {loading ? 'Logging In...' : 'LOGIN'}
//                     </button>
//                 </div>

//             </div>

//         </div>
//     </div>
// </div>


//         </>
//     );
// };

// export default Login;




// import React, { useEffect, useState } from "react";
// import "./LoginCss.css";
// import { useNavigate } from "react-router-dom";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import axios from "axios";
// import Dropdown from "./Dropdown";
// import Cookies from "js-cookie";
// import Spinner from "./Spinner";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { IoIosEyeOff,IoIosEye } from "react-icons/io";

// function Login() {
//   const [loading, setLoading] = useState(false);
//    const [showPassword,setShowPassword] =useState(false)
//   const [isClosed, setIsClosed] = useState(true);
//   const [formdata, setformdata] = useState({
//     Username: "",
//     Password: "",
//     Role: "admin",
//   });

//   const { setisLoggedIn } = useStateContext();
//   const Navigate = useNavigate();

//   function onclickHandler(event) {
//     setformdata((prevdata) => {
//       return {
//         ...prevdata,
//         [event.target.name]: event.target.value,
//       };
//     });
//   }
//   function submitHandler(e) {
//     setTimeout(() => {
//       setIsClosed(true);
//     }, 1000);
//     e.preventDefault();
//     setLoading(true);

//     const payload = {
//       email: formdata.Username,
//       password: formdata.Password,
//       role: formdata.Role,
//     };
//     sessionStorage.setItem("userRole", formdata.Role);
//     axios
//       .post("https://eserver-i5sm.onrender.com/api/v1/login", payload)
//       .then((response) => {
//         setisLoggedIn(formdata.Role);
//         Cookies.set("token", response?.data?.token, { expires: 2 });
// // console.log("LOGIN",response)
//         const fullName = response.data.user.fullName;
//         const image = response.data.user.image.url;
//         const email = response.data.user.email;
//         sessionStorage.setItem("fullName", fullName);
//         sessionStorage.setItem("image", image);
//         sessionStorage.setItem("email", email);
//         sessionStorage.setItem("response", JSON.stringify(response.data.user));
//         const token = response.data.token;
//         document.cookie = `token=${token}; path=/; max-age=86400`;
//         showSuccessToast("Login successful!!!");
//         Navigate(`/${formdata.Role}`);
        
//       })
//       .catch((error) => {
//         setLoading(false); // Stop the loading spinner
//         showErrorToast("Login failed. Please check your credentials.");
//         setIsClosed(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }
//   const showErrorToast = (message) => {
//     toast.error(message, {
//       position: toast.POSITION.TOP_RIGHT,
//       autoClose: 1000, // Auto-close the notification after 3 seconds
//       style: { marginTop: "50px" }, // Add margin-top
//     });
//   };
//   const showSuccessToast = (message) => {
//     toast.success(message, {
//       position: toast.POSITION.TOP_RIGHT,
//       autoClose: 1000,
//       style: { marginTop: "50px" },
//     });
//   };

//   const handleClick = () => {
//     setIsClosed(!isClosed);
//   };
//   useEffect(() => {
//     setTimeout(() => {
//       setIsClosed(false);
//     }, 1000);
//   }, []);
//   return (
//     <>
//       {loading && <Spinner />}
//       {
//         <div className="bg-[#1f2937] h-screen flex justify-center items-center">
//           <div className="laptop js-laptop ">
//             <div className="laptop-top">
//               <div className={`${isClosed ? "laptop--closed" : ""}`}>
//                 <div className="laptop__screen overflow-y-auto">
//                   <div className="py-5 md:px-10 px-5 ">
//                  <div className="bg-[#d2cdcd6e]">
                
//                  </div>
//                  {/* <h1 className="text-white sm:text-[10px] md:text-[15px] ">Credentials of Admin user for School demo purpose</h1>
//                   <h1 className="text-shadow-2xl font-semibold sm:text-[10px] md:text-[15px]" ><span className="text-white  ">Admin Email : </span> <span className="text-[#57dbff] ">projectdemo@gmail.com</span></h1>
//                   <h1  className="text-shadow-2xl font-semibold sm:text-[10px] md:text-[15px]"><span className="text-white ">Password : </span> <span className="text-[#57dbff] "> projectdemo</span></h1> */}
//                     <form
//                       onSubmit={submitHandler}
//                       className="space-y-2 md:px-20"
//                     >
//                       <Dropdown formdata={formdata} setformdata={setformdata} />

//                       <input
//                         className="rounded-md  bg-[#000102a1] text-white border-2 border-white w-full py-2 outline-none  px-3"
//                         required
//                         type="text"
//                         name="Username"
//                         id="Username"
//                         placeholder="User Name"
//                         value={formdata.Username}
//                         onChange={onclickHandler}
//                       />

//                     <div  className="relative">
//                     <input
//                         className="rounded-md  bg-[#000102a1] text-white border-2 border-white w-full py-2 outline-none  px-3"
//                         required
//                         placeholder="Password"
//                         type={showPassword ? 'text' : 'password'}
//                         name="Password"
//                         id="Password"
//                         value={formdata.Password}
//                         onChange={onclickHandler}
//                       />
//                       <span onClick={()=>setShowPassword(!showPassword)} className="text-2xl text-white absolute right-3 top-[10px] cursor-pointer">
//                         {showPassword ?  <IoIosEyeOff /> :  <IoIosEye />}
                      
                     
//                       </span>

//                     </div>
//                       <input
//                         type="submit"
//                         className="rounded-md w-full py-2 text-white cursor-pointer outline-none border-none px-3 bg-cyan-700"
//                       />
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="laptop__base cursor-pointer"
//               onClick={handleClick}
//             ></div>
//           </div>
//         </div>
//       }
//     </>
//   );
// }

// export default Login;



// import React, { useEffect, useState } from "react";
// import "./LoginCss.css";
// import { useNavigate } from "react-router-dom";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import axios from "axios";
// import Dropdown from "./Dropdown";
// import Cookies from "js-cookie";
// import Spinner from "./Spinner";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { IoIosEyeOff,IoIosEye } from "react-icons/io";

// function Login() {
//   const [loading, setLoading] = useState(false);
//    const [showPassword,setShowPassword] =useState(false)
//   const [isClosed, setIsClosed] = useState(true);
//   const [formdata, setformdata] = useState({
//     Username: "",
//     Password: "",
//     Role: "admin",
//   });

//   const { setisLoggedIn } = useStateContext();
//   const Navigate = useNavigate();

//   function onclickHandler(event) {
//     setformdata((prevdata) => {
//       return {
//         ...prevdata,
//         [event.target.name]: event.target.value,
//       };
//     });
//   }
//   function submitHandler(e) {
//     setTimeout(() => {
//       setIsClosed(true);
//     }, 1000);
//     e.preventDefault();
//     setLoading(true);

//     const payload = {
//       email: formdata.Username,
//       password: formdata.Password,
//       role: formdata.Role,
//     };
//     sessionStorage.setItem("userRole", formdata.Role);
//     axios
//       .post("https://eserver-i5sm.onrender.com/api/v1/login", payload)
//       .then((response) => {
//         setisLoggedIn(formdata.Role);
//         Cookies.set("token", response?.data?.token, { expires: 2 });
// // console.log("LOGIN",response)
//         const fullName = response.data.user.fullName;
//         const image = response.data.user.image.url;
//         const email = response.data.user.email;
//         sessionStorage.setItem("fullName", fullName);
//         sessionStorage.setItem("image", image);
//         sessionStorage.setItem("email", email);
//         sessionStorage.setItem("response", JSON.stringify(response.data.user));
//         const token = response.data.token;
//         document.cookie = `token=${token}; path=/; max-age=86400`;
//         showSuccessToast("Login successful!!!");
//         Navigate(`/${formdata.Role}`);
        
//       })
//       .catch((error) => {
//         setLoading(false); // Stop the loading spinner
//         showErrorToast("Login failed. Please check your credentials.");
//         setIsClosed(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }
//   const showErrorToast = (message) => {
//     toast.error(message, {
//       position: toast.POSITION.TOP_RIGHT,
//       autoClose: 1000, // Auto-close the notification after 3 seconds
//       style: { marginTop: "50px" }, // Add margin-top
//     });
//   };
//   const showSuccessToast = (message) => {
//     toast.success(message, {
//       position: toast.POSITION.TOP_RIGHT,
//       autoClose: 1000,
//       style: { marginTop: "50px" },
//     });
//   };

//   const handleClick = () => {
//     setIsClosed(!isClosed);
//   };
//   useEffect(() => {
//     setTimeout(() => {
//       setIsClosed(false);
//     }, 1000);
//   }, []);
//   return (
//     <>
//       {loading && <Spinner />}
//       {
//         <div className="bg-[#1f2937] h-screen flex justify-center items-center">
//           <div className="laptop js-laptop ">
//             <div className="laptop-top">
//               <div className={`${isClosed ? "laptop--closed" : ""}`}>
//                 <div className="laptop__screen overflow-y-auto">
//                   <div className="py-5 md:px-10 px-5 ">
//                  <div className="bg-[#d2cdcd6e]">
                
//                  </div>
//                  {/* <h1 className="text-white sm:text-[10px] md:text-[15px] ">Credentials of Admin user for School demo purpose</h1>
//                   <h1 className="text-shadow-2xl font-semibold sm:text-[10px] md:text-[15px]" ><span className="text-white  ">Admin Email : </span> <span className="text-[#57dbff] ">projectdemo@gmail.com</span></h1>
//                   <h1  className="text-shadow-2xl font-semibold sm:text-[10px] md:text-[15px]"><span className="text-white ">Password : </span> <span className="text-[#57dbff] "> projectdemo</span></h1> */}
//                     <form
//                       onSubmit={submitHandler}
//                       className="space-y-2 md:px-20"
//                     >
//                       <Dropdown formdata={formdata} setformdata={setformdata} />

//                       <input
//                         className="rounded-md  bg-[#000102a1] text-white border-2 border-white w-full py-2 outline-none  px-3"
//                         required
//                         type="text"
//                         name="Username"
//                         id="Username"
//                         placeholder="User Name"
//                         value={formdata.Username}
//                         onChange={onclickHandler}
//                       />

//                     <div  className="relative">
//                     <input
//                         className="rounded-md  bg-[#000102a1] text-white border-2 border-white w-full py-2 outline-none  px-3"
//                         required
//                         placeholder="Password"
//                         type={showPassword ? 'text' : 'password'}
//                         name="Password"
//                         id="Password"
//                         value={formdata.Password}
//                         onChange={onclickHandler}
//                       />
//                       <span onClick={()=>setShowPassword(!showPassword)} className="text-2xl text-white absolute right-3 top-[10px] cursor-pointer">
//                         {showPassword ?  <IoIosEyeOff /> :  <IoIosEye />}
                      
                     
//                       </span>

//                     </div>
//                       <input
//                         type="submit"
//                         className="rounded-md w-full py-2 text-white cursor-pointer outline-none border-none px-3 bg-cyan-700"
//                       />
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="laptop__base cursor-pointer"
//               onClick={handleClick}
//             ></div>
//           </div>
//         </div>
//       }
//     </>
//   );
// }

// export default Login;


