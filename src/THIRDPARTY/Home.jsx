import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ThirdPartyMobile from './Mobile/ThirdPartyMobile';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { useStateContext } from '../contexts/ContextProvider';


const Home = () => {

  const [schoolId,setSchoolId]=useState(null)
    const {
        currentColor,
       
        isFullScreen, setIsFullScreen,toggleFullScreen
      } = useStateContext();
    // const [isFlage,setFlag]=useState(true)
    const [isFlage,setFlag]=useState(()=>{
        return JSON.parse(localStorage.getItem("isFlage")) || false
    })
    useEffect(()=>{
localStorage.setItem("isFlage",JSON.stringify(isFlage))
    },[isFlage])
    const [response, setResponse] = useState(null);
    const [selectedSchoolId, setSelectedSchoolId] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const storedResponse = sessionStorage.getItem("response");
        if (storedResponse) {
            try {
                setResponse(JSON.parse(storedResponse));
            } catch (error) {
                console.error("Error parsing sessionStorage response:", error);
                sessionStorage.removeItem("response");
            }
        }
    }, []);

    const handleLogout = () => {
        axios
            .get("https://eserver-i5sm.onrender.com/api/v1/logout")
            .then(() => {
                sessionStorage.clear();
                localStorage.clear();
                navigate("/");
            })
            .catch((error) => {
                sessionStorage.clear();
                console.error("Logout error:", error);
            });
    };

    const handleSchoolChange = (event) => {
        setSelectedSchoolId(event.target.value);
    };

    const handleRedirect = () => {
        if (selectedSchoolId) {
          setSchoolId(selectedSchoolId)
           console.log("selectedSchoolId",selectedSchoolId)
            setFlag(true);
            localStorage.setItem("SchoolID",selectedSchoolId)
           
        }
    };

    if (!response) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const { name, email, assignedSchools } = response;
    const handleClicked=()=>{
        setIsFullScreen(!isFullScreen)
        toggleFullScreen()
    
      }
    return (
       
     <>
{
     isFlage ? 
    (
        <ThirdPartyMobile schoolId={schoolId}/>
     )
     : (
        <>
        <div className="h-full bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
  <div className="relative py-3 sm:max-w-xl sm:mx-auto">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-[#26aadf] shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
    <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
      <div className="max-w-md mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
            Welcome, {name}!
          </h1>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="py-4 text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
            <p>
              <span className="font-medium">Name:</span> {name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {email}
            </p>
            <div className="mb-4">
              <label
                htmlFor="schoolSelect"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Select a School:
              </label>
              <select
                id="schoolSelect"
                onChange={handleSchoolChange}
                value={selectedSchoolId || ""}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Select School --</option>
                {assignedSchools.map((school) => (
                  <option key={school.schoolId} value={school.schoolId}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>

            {selectedSchoolId && (
              <button
                onClick={handleRedirect}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4 w-full sm:w-auto" // Added w-full on mobile
              >
                Go to School
              </button>
            )}

            <div className="py-2 text-center flex justify-center">
              <button
                onClick={() => handleClicked()}
                className="py-2 border-none"
                // style={{ color: currentColor }}
              >
                {isFullScreen ? (
                  <MdFullscreenExit
                    className="text-[50px] text-[#f0592e]"
                    title="Fullscreen Exit "
                  />
                ) : (
                  <MdFullscreen
                    className="text-[50px] text-[#f0592e] "
                    title="full screen"
                  />
                )}
              </button>
            </div>
            <div className="pt-4 text-base leading-6 font-bold sm:text-lg sm:leading-7">
              <button
                onClick={handleLogout}
                className="transition duration-200 bg-[#f0592e] hover:bg-[#f0595e] focus:bg-red-700 focus:shadow-sm focus:ring-4 focus:ring-opacity-50 focus:ring-red-500 text-white w-full py-2.5 rounded-lg shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
         {/* <div className="h-full bg-gray-100 py-6 flex flex-col justify-center sm:py-12 ">
              <div className="relative py-3 sm:max-w-xl sm:mx-auto ">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-[#26aadf] shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                  <div className="max-w-md mx-auto">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                        Welcome, {name}!
                      </h1>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="py-4 text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
                        <p>
                          <span className="font-medium">Name:</span> {name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {email}
                        </p>
                        <div className="mb-4">
            <label htmlFor="schoolSelect" className="block text-gray-700 text-sm font-bold mb-2">
                Select a School:
            </label>
            <select
                id="schoolSelect"
                onChange={handleSchoolChange}
                value={selectedSchoolId || ''}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
                <option value="">-- Select School --</option>
                {assignedSchools.map((school) => (
                    <option key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                    </option>
                ))}
            </select>
        </div>

        {selectedSchoolId && (
             <button
                onClick={handleRedirect}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
              >
                Go to School
              </button>
        )}


       
                       <div   className="py-2 text-center flex justify-center">
                               <button
                                onClick={()=>handleClicked()}
                                className="py-2 border-none"
                                // style={{ color: currentColor }}
                               >
                                {isFullScreen ? <MdFullscreenExit className="text-[50px] text-[#f0592e]" title="Fullscreen Exit " /> : <MdFullscreen className="text-[50px] text-[#f0592e] " title="full screen" />}
                               </button>
                            </div>
                      <div className="pt-4 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                        <button
                          onClick={handleLogout}
                          className="transition duration-200 bg-[#f0592e] hover:bg-[#f0595e] focus:bg-red-700 focus:shadow-sm focus:ring-4 focus:ring-opacity-50 focus:ring-red-500 text-white w-full py-2.5 rounded-lg shadow-sm hover:shadow-md font-semibold text-center inline-block"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              </div> */}
           

     </>
    )
};
</>)
};

export default Home;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//     const [response, setResponse] = useState(null);
//     const [selectedSchoolId, setSelectedSchoolId] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const storedResponse = sessionStorage.getItem("response");
//         if (storedResponse) {
//             try {
//                 setResponse(JSON.parse(storedResponse));
//             } catch (error) {
//                 console.error("Error parsing sessionStorage response:", error);
//                 // Handle the error appropriately, perhaps by clearing the sessionStorage
//                 sessionStorage.removeItem("response");
//             }
//         }
//     }, []);

//     const handleLogout = () => {
//         axios
//             .get("https://eserver-i5sm.onrender.com/api/v1/logout")
//             .then(() => {
//                 sessionStorage.clear();
//                 localStorage.clear();
//                 navigate("/");
//             })
//             .catch((error) => {
//                 sessionStorage.clear();
//                 console.error("Logout error:", error);
//             });
//     };

//     const handleSchoolChange = (event) => {
//         setSelectedSchoolId(event.target.value);
//     };

//     const handleRedirect = () => {
//         if (selectedSchoolId) {
//             navigate(`/thirdparty/school?schoolId=${selectedSchoolId}`);
//             // navigate(`/school`); // Adjust the route as needed
//         }
//     };

//     if (!response) {
//         return <div>Loading...</div>; // Or some other loading indicator
//     }

//     const { name, email, assignedSchools } = response;

//     return (
//         <div>
//             <h1>Welcome Home!</h1>
//             <p>User Name: {name}</p>
//             <p>Email: {email}</p>

//             <label htmlFor="schoolSelect">Select a School:</label>
//             <select id="schoolSelect" onChange={handleSchoolChange} value={selectedSchoolId || ''}>
//                 <option value="">-- Select School --</option>
//                 {assignedSchools.map((school) => (
//                     <option key={school.schoolId} value={school.schoolId}>
//                         {school.schoolName}
//                     </option>
//                 ))}
//             </select>

//             {selectedSchoolId && (
//                 <button onClick={handleRedirect}>Go to School</button>
//             )}

//             <button onClick={handleLogout}>Logout</button>
//         </div>
//     );
// };

// export default Home;



// import React from 'react'
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';  // Import useNavigate

// const Home = () => {
//     let response=sessionStorage.getItem("response");
//     console.log("response",response)
//     const navigate = useNavigate(); // Initialize useNavigate

//     const handleLogout = () => {
//         axios
//           .get("https://eserver-i5sm.onrender.com/api/v1/logout")
//           .then((response) => {
//             sessionStorage.clear()
//             localStorage.clear();
//             navigate("/"); // Redirect to the home page after logout
//           })
//           .catch((error) => {
//             sessionStorage.clear()
//             console.error("Logout error:", error); // Log the error for debugging
//           });
//       };

//   return (
//     <div>
//       <h1>Welcome Home!</h1>
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   )
// }

// export default Home

// import React from 'react'
// const Home = () => {
//     const handleLogout = () => {
//         axios
//           .get("https://eserver-i5sm.onrender.com/api/v1/logout")
//           .then((response) => {
//             sessionStorage.clear()
//             localStorage.clear();
//             navigate("/");
//           })
//           .catch((error) => {
//             sessionStorage.clear()
//           });
//       };
//   return (
//     <div>
     
//     </div>
//   )
// }

// export default Home
