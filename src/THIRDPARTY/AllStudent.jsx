

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg';
import { FaEdit } from 'react-icons/fa'; // Import edit icon
import Modal from '../Dynamic/Modal';
import Button from '../Dynamic/utils/Button';
import axios from 'axios';
import { useStateContext } from '../contexts/ContextProvider';
import Cookies from "js-cookie";
import DynamicFormFileds from '../Dynamic/Form/Admission/DynamicFormFields';
import { ThirdpartyGetAllStudent } from '../Network/ThirdPartyApi';
function AllStudent() {
     const authToken = Cookies.get("token");
     const [loading, setLoading] = useState(false);
       const { currentColor } = useStateContext();
     const [getClass, setGetClass] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
       const [availableSections, setAvailableSections] = useState([]);
    

    const initialStudents = [
        {
          photo: 'https://images.unsplash.com/photo-1541516160071-4bb0c5af65ba?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFraW5nJTIwcGhvdG98ZW58MHx8MHx8fDA%3D', // Default placeholder image
          name: 'John Doe',
          class: '10th',
          rollNo: '12345',
          admissionNo: '67890',
          fatherName: 'Mr. Smith',
          mobileNo: '9876543210',
          address: '123 Main Street, Anytown',
          guardianName: '',
          remarks: '',
          transport: '',
          motherName: '',
          motherPhoto: "https://thumbs.dreamstime.com/b/child-girl-schoolgirl-elementary-school-student-123686003.jpg",
          fatherPhoto: "https://plus.unsplash.com/premium_photo-1682091992663-2e4f4a5534ba?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFsZSUyMHN0dWRlbnR8ZW58MHx8MHx8fDA%3D",
          guardianPhoto: "https://thumbs.dreamstime.com/b/child-girl-schoolgirl-elementary-school-student-123686003.jpg",
        },
        {
          photo: 'blob:http://localhost:3000/c004d2ec-2670-48e7-b14a-a32cf10685bb',
          name: 'Jane Doe',
          class: '9th',
          rollNo: '54321',
          admissionNo: '09876',
          fatherName: 'Mr. Johnson',
          mobileNo: '8765432109',
          address: '456 Oak Avenue, Anytown',
          guardianName: '',
          remarks: '',
          transport: 'Bus A',
          motherName: '',
          motherPhoto: null,
          fatherPhoto: null,
          guardianPhoto: null,
        },
        {
          photo: 'blob:http://localhost:3000/70f84022-becd-46fd-a5a8-a5b64546790a',
          name: 'Peter Pan',
          class: '11th',
          rollNo: '24680',
          admissionNo: '13579',
          fatherName: 'Mr. Pan',
          mobileNo: '7654321098',
          address: '789 Pine Lane, Anytown',
          guardianName: '',
          remarks: 'Excellent student',
          transport: '',
          motherName: '',
          motherPhoto: null,
          fatherPhoto: null,
          guardianPhoto: null,
        },
        {
          photo: 'blob:http://localhost:3000/70f84022-becd-46fd-a5a8-a5b64546790a',
          name: 'Alice Wonderland',
          class: '12th',
          rollNo: '98765',
          admissionNo: '54321',
          fatherName: 'Mr. Wonderland',
          mobileNo: '6543210987',
          address: '101 Rabbit Hole, Anytown',
          guardianName: '',
          remarks: '',
          transport: 'Self',
          motherName: '',
          motherPhoto: 'blob:http://localhost:3000/c004d2ec-2670-48e7-b14a-a32cf10685bb',
          fatherPhoto: 'blob:http://localhost:3000/70f84022-becd-46fd-a5a8-a5b64546790a',
          guardianPhoto: 'blob:http://localhost:3000/c004d2ec-2670-48e7-b14a-a32cf10685bb',
        },
        {
          photo: 'blob:http://localhost:3000/c004d2ec-2670-48e7-b14a-a32cf10685bb',
          name: 'Bob Builder',
          class: '10th',
          rollNo: '11223',
          admissionNo: '44556',
          fatherName: 'Mr. Builder',
          mobileNo: '5432109876',
          address: '222 Tool Street, Anytown',
          guardianName: '',
          remarks: 'Needs improvement in Math',
          transport: 'Bus B',
          motherName: 'MAA',
          motherPhoto: 'blob:http://localhost:3000/70f84022-becd-46fd-a5a8-a5b64546790a',
          fatherPhoto: 'blob:http://localhost:3000/f3a323de-31c3-4b3e-b2eb-9ee4e32b5d3a',
          guardianPhoto: 'blob:http://localhost:3000/4a312978-3103-4524-b19e-fd5cf58d4310',
        },
      ];
      
    //   console.log(initialStudents);
    const [students, setStudents] = useState(initialStudents);
    const [values, setValues] = useState({});
    console.log("values",values)
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    // const [crop, setCrop] = useState({ x: 0, y: 0 });
    // const [zoom, setZoom] = useState(1);
    // const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    // const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper
    // const [currentPhotoField, setCurrentPhotoField] = useState(null);
    // const [isEditingPhoto, setIsEditingPhoto] = useState(false); // New state to track photo editing
    // const [photoInputValue, setPhotoInputValue] = useState(''); // Store the photo input value
    const setStudentsCallback = useCallback(setStudents, []);
    // const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
    // const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

    const handleEditClick = useCallback((index) => {
        setEditingIndex(index);
        setValues(index)
        setModalOpen(true);
    }, []);
    useEffect(() => {
        if (editingIndex !== null) {
        }
    }, [editingIndex]);

    const handleClassChange = (e) => {
        const selectedClassName = e.target.value;
        setSelectedClass(selectedClassName);
        const selectedClassObj = getClass?.find(
          (cls) => cls.className === selectedClassName
        );
    
        if (selectedClassObj) {
          setAvailableSections(selectedClassObj.sections.split(", "));
        } else {
          setAvailableSections([]);
        }
      };

    useEffect(() => {
        axios
          .get(
            `https://eshikshaserver.onrender.com/api/v1/adminRoute/getAllClasses`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          )
          .then((response) => {
            let classes = response.data.classList;
    
            setGetClass(classes.sort((a, b) => a - b));
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }, []);

 
      const getStudent = async()=>{
try {
    const response = await ThirdpartyGetAllStudent()
    console.log("response",response)
    // const student = response.data.student
} catch (error) {
    console.log("error",error)
}
      }
useEffect(()=>{
    getStudent()
},[])

    return (
     <>
     
     <div className="bg-gray-800 p-2 fixed top-0 w-full"
        style={{ background: "#f0592e" }}
      
    >
        <div className="flex justify-around max-w-md mx-auto">
        <input type="text" />
           <div className="flex flex-col space-y-1 mt-[2px]">
                    
                     <select
                       name="studentClass"
                       className=" w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
                       onFocus={(e) =>
                         (e.target.style.borderColor = currentColor)
                       }
                       onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                       value={selectedClass}
                       onChange={handleClassChange}
                       required
                     >
                       <option value="" disabled>
                          Class
                       </option>
                       {getClass?.map((cls, index) => (
                         <option key={index} value={cls.className}>
                           {cls?.className}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="flex flex-col space-y-1 mt-[2px]">
                    
                     <select
                       name="studentSection"
                       className=" w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
                       onFocus={(e) =>
                         (e.target.style.borderColor = currentColor)
                       }
                       onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                       value={selectedClass}
                       onChange={handleClassChange}
                       required
                     >
                       <option value="" disabled>
                   Section
                       </option>
                       {availableSections?.map((item, index) => (
                        <option key={index} value={item}>
                        {item}
                      </option>
                       ))}
                     </select>
                   </div>
        </div>
    </div>
        <div className="container mx-auto p-4 grid md:grid-cols-3 gap-4">
            {students.map((student, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-4 mt-5 mb-2 flex items-center justify-between">
                    <div>
                        <div className="mb-2">
                            <p className="text-gray-700 font-semibold">Name: {student.name}</p>
                            <p className="text-gray-700">Class: {student.class}</p>
                            <p className="text-gray-700">Roll No: {student.rollNo}</p>
                            <p className="text-gray-700">Adm No: {student.admissionNo}</p>
                            <p className="text-gray-700">Father Name: {student.fatherName}</p>
                            <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
                            <p className="text-gray-700">Address: {student.address}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="mr-4">
                            <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" />
                        </div>
                        {/* Edit Icon Button */}
                        <button
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            onClick={() => handleEditClick(student)}
                        >
                            <FaEdit size={20} />
                        </button>
                    </div>
                </div>
            ))}
          

          <Modal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={`Edit`}
      >
        <DynamicFormFileds student={values}
        //  setStudent={setStudent}
         />
          
                {/* {editingIndex !== null && (
                    <div className="mt-4">
                        {croppedImageSource ? (
                            <div className='relative w-full aspect-square'>
                                <Cropper
                                    image={croppedImageSource}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
                                    <button
                                        onClick={cancelCrop}
                                        className='bg-red-500 text-white py-2 px-4 rounded'>
                                        Cancel Crop
                                    </button>
                                    <button
                                        onClick={showCroppedImage}
                                        className='bg-blue-500 text-white py-2 px-4 rounded'>
                                        Crop Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='px-2 pb-2'>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Name:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Name"
                                        value={students[editingIndex].name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class">
                                        Class:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="class"
                                        name="class"
                                        type="text"
                                        placeholder="Class"
                                        value={students[editingIndex].class}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rollNo">
                                        Roll No:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="rollNo"
                                        name="rollNo"
                                        type="text"
                                        placeholder="Roll No"
                                        value={students[editingIndex].rollNo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admissionNo">
                                        Admission No:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="admissionNo"
                                        name="admissionNo"
                                        type="text"
                                        placeholder="Admission No"
                                        value={students[editingIndex].admissionNo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherName">
                                        Father Name:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="fatherName"
                                        name="fatherName"
                                        type="text"
                                        placeholder="Father Name"
                                        value={students[editingIndex].fatherName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNo">
                                        Mobile No:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="mobileNo"
                                        name="mobileNo"
                                        type="text"
                                        placeholder="Mobile No"
                                        value={students[editingIndex].mobileNo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                                        Address:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="address"
                                        name="address"
                                        type="text"
                                        placeholder="Address"
                                        value={students[editingIndex].address}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
                                        Student Photo:
                                    </label>
                                    
                                 
 
    <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        onChange={(e) => handlePhotoChange(e, 'photo')}
        value={isEditingPhoto ? photoInputValue : ''}
    />

                                    {students[editingIndex].photo && !croppedImageSource && (
                                        <img
                                            src={students[editingIndex].photo}
                                            alt="Student"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>

                                

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                        Transport:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="transport"
                                        name="transport"
                                        type="text"
                                        placeholder="Transport"
                                        value={students[editingIndex].transport}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
                                        Mother Name:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="motherName"
                                        name="motherName"
                                        type="text"
                                        placeholder="Mother Name"
                                        value={students[editingIndex].motherName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
                                        Mother Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="motherPhoto"
                                        name="motherPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
                                        value={isEditingPhoto ? photoInputValue : ''}
                                    />
                                    {students[editingIndex].motherPhoto && !croppedImageSource && (
                                        <img
                                            src={students[editingIndex].motherPhoto}
                                            alt="Mother"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
                                        Father Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="fatherPhoto"
                                        name="fatherPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
                                        value={isEditingPhoto ? photoInputValue : ''}

                                    />
                                    {students[editingIndex].fatherPhoto && !croppedImageSource && (
                                        <img
                                            src={students[editingIndex].fatherPhoto}
                                            alt="Father"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
                                        Guardian Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="guardianPhoto"
                                        name="guardianPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
                                        value={isEditingPhoto ? photoInputValue : ''}

                                    />
                                    {students[editingIndex].guardianPhoto && !croppedImageSource && (
                                        <img
                                            src={students[editingIndex].guardianPhoto}
                                            alt="Guardian"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>
                                <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
            <Button loading={loading} name="Submit" color="#f0592e"
            // onClick={handleSubmit}
             width="full" />
            <Button name="Cancel" color="gray" onClick={() => setModalOpen(false)}  width="full" />
          </div>
                            </div>
                        )}
                    </div>
                )} */}
            </Modal>
          
        </div>
     </>
    );
}

export default AllStudent;


// import React, { useState, useCallback, useEffect } from 'react';
// import Cropper from 'react-easy-crop';
// import getCroppedImg from './getCroppedImg';
// import { FaEdit } from 'react-icons/fa'; // Import edit icon

// // Modal component (as before)
// const Modal = ({ isOpen, setIsOpen, title, children, onSave, onCancel }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//                 <div className="mt-3 text-center">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//                     <div className="mt-2 px-7 py-3">
//                         {children}
//                     </div>
//                     <div className="items-center px-4 py-3">
//                         <button
//                             className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mr-2"
//                             onClick={onSave} // Call the onSave function
//                         >
//                             Submit
//                         </button>
//                         <button
//                             className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                             onClick={onCancel}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AllStudent() {
//     // Initial array of 10 student data objects
//     const initialStudents = Array(10).fill({
//         photo: 'https://via.placeholder.com/150', // Default placeholder image
//         name: 'John Doe',
//         class: '10th',
//         rollNo: '12345',
//         admissionNo: '67890',
//         fatherName: 'Mr. Smith',
//         mobileNo: '9876543210',
//         address: '123 Main Street, Anytown',
//         guardianName: '',
//         remarks: '',
//         transport: '',
//         motherName: '',
//         motherPhoto: null,
//         fatherPhoto: null,
//         guardianPhoto: null,
//     });

//     const [students, setStudents] = useState(initialStudents);

//     // State for the modal
//     const [modalOpen, setModalOpen] = useState(false);

//     // State to track the currently editing student index
//     const [editingIndex, setEditingIndex] = useState(null);

//     // State for the image cropping
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper

//     // New State added to identify the current Photo being changed
//     const [currentPhotoField, setCurrentPhotoField] = useState(null);
//     const [isEditingPhoto, setIsEditingPhoto] = useState(false); // New state to track photo editing
//     const [photoInputValue, setPhotoInputValue] = useState(''); // Store the photo input value


//     // Wrap state updates with useCallback
//     const setStudentsCallback = useCallback(setStudents, []);
//     const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
//     const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

//     // Function to handle input field changes (for the currently edited student)
//     const handleInputChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setStudentsCallback(prevStudents =>
//             prevStudents.map((student, index) =>
//                 index === editingIndex ? { ...student, [name]: value } : student
//             )
//         );
//     }, [editingIndex, setStudentsCallback]);

//     // Function to handle photo input changes (for the currently edited student)
//     const handlePhotoChange = useCallback((e, photoField) => {
//         const { files } = e.target;
//         setCurrentPhotoFieldCallback(photoField);
//         setIsEditingPhoto(true);
//         setPhotoInputValue(e.target.value); // Store the file input value
//         if (files && files[0]) {
//             const reader = new FileReader();
//             reader.onload = () => {
//                 setCroppedImageSourceCallback(reader.result);
//             };
//             reader.readAsDataURL(files[0]);
//         }
//     }, [setCroppedImageSourceCallback, setCurrentPhotoFieldCallback]);

//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const showCroppedImage = useCallback(async () => {
//         try {
//             if (!croppedImageSource || !croppedAreaPixels) {
//                 console.error("Cannot crop image: imageSrc or croppedAreaPixels is missing.");
//                 return;
//             }

//             const croppedImageURL = await getCroppedImg(croppedImageSource, croppedAreaPixels);

//             setCroppedImageSourceCallback(null); // Hide the Cropper
//             setStudentsCallback(prevStudents =>
//                 prevStudents.map((student, index) =>
//                     index === editingIndex ? { ...student, [currentPhotoField]: croppedImageURL } : student
//                 )
//             );
//             setCurrentPhotoFieldCallback(null);
//             setIsEditingPhoto(false); // Reset photo editing flag
//             setPhotoInputValue(''); // Clear the input value

//         } catch (error) {
//             console.error("Error cropping image:", error);
//         }
//     }, [croppedAreaPixels, croppedImageSource, editingIndex, currentPhotoField, setStudentsCallback, setCurrentPhotoFieldCallback, setCroppedImageSourceCallback]);

//     const cancelCrop = useCallback(() => {
//         setCroppedImageSource(null);
//         setIsEditingPhoto(false);
//         setPhotoInputValue('');
//     }, [setCroppedImageSource]);

//     // Function to open the modal and set the editing index
//     const handleEditClick = useCallback((index) => {
//         setEditingIndex(index);
//         setModalOpen(true);
//     }, []);

//     // Function to submit the changes and close the modal
//     const handleSubmitClick = useCallback(() => {
//         setModalOpen(false);
//         setEditingIndex(null);
//         setIsEditingPhoto(false);
//         setPhotoInputValue(''); // Clear the photo input value

//         //persist the data to state
//         console.log("Submitted students data:", students);
//     }, [students]);

//     // Function to cancel the changes and close the modal
//     const handleCancelClick = useCallback(() => {
//         setModalOpen(false);
//         setEditingIndex(null);
//         setIsEditingPhoto(false);
//         setPhotoInputValue(''); // Clear the photo input value
//         // Optionally, revert changes made in the modal
//     }, []);

//     // Set initial values in the modal when it opens
//     useEffect(() => {
//         if (editingIndex !== null) {
//             // No need to set values here directly as they are already being set via the `value` prop in the inputs.
//         }
//     }, [editingIndex]);


//     return (
//         <div className="container mx-auto p-4">
//             {students.map((student, index) => (
//                 <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between">
//                     <div>
//                         <div className="mb-2">
//                             <p className="text-gray-700 font-semibold">Name: {student.name}</p>
//                             <p className="text-gray-700">Class: {student.class}</p>
//                             <p className="text-gray-700">Roll No: {student.rollNo}</p>
//                             <p className="text-gray-700">Adm No: {student.admissionNo}</p>
//                             <p className="text-gray-700">Father Name: {student.fatherName}</p>
//                             <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
//                             <p className="text-gray-700">Address: {student.address}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center">
//                         <div className="mr-4">
//                             <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" />
//                         </div>
//                         {/* Edit Icon Button */}
//                         <button
//                             className="text-blue-500 hover:text-blue-700 focus:outline-none"
//                             onClick={() => handleEditClick(index)}
//                         >
//                             <FaEdit size={20} />
//                         </button>
//                     </div>
//                 </div>
//             ))}


//             <Modal
//                 isOpen={modalOpen}
//                 setIsOpen={setModalOpen}
//                 title="Edit Student Information"
//                 onSave={handleSubmitClick} // Pass the save function
//                 onCancel={handleCancelClick} // Pass the cancel function
//             >
//                 {/* Content of the modal (additional fields) */}
//                 {editingIndex !== null && (
//                     <div className="mt-4">
//                         {croppedImageSource ? (
//                             <div className='relative w-full aspect-square'>
//                                 <Cropper
//                                     image={croppedImageSource}
//                                     crop={crop}
//                                     zoom={zoom}
//                                     aspect={1}
//                                     onCropChange={setCrop}
//                                     onZoomChange={setZoom}
//                                     onCropComplete={onCropComplete}
//                                 />
//                                 <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
//                                     <button
//                                         onClick={cancelCrop}
//                                         className='bg-red-500 text-white py-2 px-4 rounded'>
//                                         Cancel Crop
//                                     </button>
//                                     <button
//                                         onClick={showCroppedImage}
//                                         className='bg-blue-500 text-white py-2 px-4 rounded'>
//                                         Crop Image
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {/* Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
//                                         Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="name"
//                                         name="name"
//                                         type="text"
//                                         placeholder="Name"
//                                         value={students[editingIndex].name}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>
//                                 {/* Class */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class">
//                                         Class:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="class"
//                                         name="class"
//                                         type="text"
//                                         placeholder="Class"
//                                         value={students[editingIndex].class}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Roll No */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rollNo">
//                                         Roll No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="rollNo"
//                                         name="rollNo"
//                                         type="text"
//                                         placeholder="Roll No"
//                                         value={students[editingIndex].rollNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Admission No */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admissionNo">
//                                         Admission No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="admissionNo"
//                                         name="admissionNo"
//                                         type="text"
//                                         placeholder="Admission No"
//                                         value={students[editingIndex].admissionNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Father Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherName">
//                                         Father Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherName"
//                                         name="fatherName"
//                                         type="text"
//                                         placeholder="Father Name"
//                                         value={students[editingIndex].fatherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mobile No */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNo">
//                                         Mobile No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="mobileNo"
//                                         name="mobileNo"
//                                         type="text"
//                                         placeholder="Mobile No"
//                                         value={students[editingIndex].mobileNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Address */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
//                                         Address:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="address"
//                                         name="address"
//                                         type="text"
//                                         placeholder="Address"
//                                         value={students[editingIndex].address}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Student Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
//                                         Student Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="photo"
//                                         name="photo"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'photo')}
//                                         value={isEditingPhoto ? photoInputValue : ''}
//                                     />
//                                     {students[editingIndex].photo && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].photo}
//                                             alt="Student"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianName">
//                                         Guardian Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianName"
//                                         name="guardianName"
//                                         type="text"
//                                         placeholder="Guardian Name"
//                                         value={students[editingIndex].guardianName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Transport */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
//                                         Transport:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="transport"
//                                         name="transport"
//                                         type="text"
//                                         placeholder="Transport"
//                                         value={students[editingIndex].transport}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
//                                         Mother Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherName"
//                                         name="motherName"
//                                         type="text"
//                                         placeholder="Mother Name"
//                                         value={students[editingIndex].motherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
//                                         Mother Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherPhoto"
//                                         name="motherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}
//                                     />
//                                     {students[editingIndex].motherPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].motherPhoto}
//                                             alt="Mother"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Father Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
//                                         Father Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherPhoto"
//                                         name="fatherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}

//                                     />
//                                     {students[editingIndex].fatherPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].fatherPhoto}
//                                             alt="Father"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
//                                         Guardian Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianPhoto"
//                                         name="guardianPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}

//                                     />
//                                     {students[editingIndex].guardianPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].guardianPhoto}
//                                             alt="Guardian"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// }

// export default AllStudent;




// import React, { useState, useCallback, useEffect } from 'react';
// import Cropper from 'react-easy-crop';
// import getCroppedImg from './getCroppedImg';
// import { FaEdit } from 'react-icons/fa'; // Import edit icon

// // Modal component (as before)
// const Modal = ({ isOpen, setIsOpen, title, children, onSave }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//                 <div className="mt-3 text-center">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//                     <div className="mt-2 px-7 py-3">
//                         {children}
//                     </div>
//                     <div className="items-center px-4 py-3">
//                         <button
//                             className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mr-2"
//                             onClick={onSave} // Call the onSave function
//                         >
//                             Save
//                         </button>
//                         <button
//                             className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                             onClick={() => setIsOpen(false)}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AllStudent() {
//     // Initial array of 10 student data objects
//     const initialStudents = Array(10).fill({
//         photo: 'https://via.placeholder.com/150', // Default placeholder image
//         name: 'John Doe',
//         class: '10th',
//         rollNo: '12345',
//         admissionNo: '67890',
//         fatherName: 'Mr. Smith',
//         mobileNo: '9876543210',
//         address: '123 Main Street, Anytown',
//         guardianName: '',
//         remarks: '',
//         transport: '',
//         motherName: '',
//         motherPhoto: null,
//         fatherPhoto: null,
//         guardianPhoto: null,
//     });

//     const [students, setStudents] = useState(initialStudents);

//     // State for the modal
//     const [modalOpen, setModalOpen] = useState(false);

//     // State to track the currently editing student index
//     const [editingIndex, setEditingIndex] = useState(null);

//     // State for the image cropping
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper

//     // New State added to identify the current Photo being changed
//     const [currentPhotoField, setCurrentPhotoField] = useState(null);
//     const [isEditingPhoto, setIsEditingPhoto] = useState(false); // New state to track photo editing
//     const [photoInputValue, setPhotoInputValue] = useState(''); // Store the photo input value


//     // Wrap state updates with useCallback
//     const setStudentsCallback = useCallback(setStudents, []);
//     const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
//     const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

//     // Function to handle input field changes (for the currently edited student)
//     const handleInputChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setStudentsCallback(prevStudents =>
//             prevStudents.map((student, index) =>
//                 index === editingIndex ? { ...student, [name]: value } : student
//             )
//         );
//     }, [editingIndex, setStudentsCallback]);

//     // Function to handle photo input changes (for the currently edited student)
//     const handlePhotoChange = useCallback((e, photoField) => {
//         const { files } = e.target;
//         setCurrentPhotoFieldCallback(photoField);
//         setIsEditingPhoto(true);
//         setPhotoInputValue(e.target.value); // Store the file input value
//         if (files && files[0]) {
//             const reader = new FileReader();
//             reader.onload = () => {
//                 setCroppedImageSourceCallback(reader.result);
//             };
//             reader.readAsDataURL(files[0]);
//         }
//     }, [setCroppedImageSourceCallback, setCurrentPhotoFieldCallback]);

//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const showCroppedImage = useCallback(async () => {
//         try {
//             if (!croppedImageSource || !croppedAreaPixels) {
//                 console.error("Cannot crop image: imageSrc or croppedAreaPixels is missing.");
//                 return;
//             }

//             const croppedImageURL = await getCroppedImg(croppedImageSource, croppedAreaPixels);

//             setCroppedImageSourceCallback(null); // Hide the Cropper
//             setStudentsCallback(prevStudents =>
//                 prevStudents.map((student, index) =>
//                     index === editingIndex ? { ...student, [currentPhotoField]: croppedImageURL } : student
//                 )
//             );
//             setCurrentPhotoFieldCallback(null);
//             setIsEditingPhoto(false); // Reset photo editing flag
//             setPhotoInputValue(''); // Clear the input value

//         } catch (error) {
//             console.error("Error cropping image:", error);
//         }
//     }, [croppedAreaPixels, croppedImageSource, editingIndex, currentPhotoField, setStudentsCallback, setCurrentPhotoFieldCallback, setCroppedImageSourceCallback]);

//     const cancelCrop = useCallback(() => {
//         setCroppedImageSource(null);
//         setIsEditingPhoto(false);
//         setPhotoInputValue('');
//     }, [setCroppedImageSource]);

//     // Function to open the modal and set the editing index
//     const handleEditClick = useCallback((index) => {
//         setEditingIndex(index);
//         setModalOpen(true);
//     }, []);

//     // Function to save the changes and close the modal
//     const handleSaveClick = useCallback(() => {
//         setModalOpen(false);
//         setEditingIndex(null);
//         setIsEditingPhoto(false);
//         setPhotoInputValue(''); // Clear the photo input value

//         //persist the data to state
//         console.log("Saved students data:", students);
//     }, [students]);

//     // Set initial values in the modal when it opens
//     useEffect(() => {
//         if (editingIndex !== null) {
//             // Optionally, set initial values based on the student data
//             // This could involve setting state variables for each input field
//             // inside the modal, using the corresponding student data.

//         }
//     }, [editingIndex]);


//     return (
//         <div className="container mx-auto p-4">
//             {students.map((student, index) => (
//                 <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between">
//                     <div>
//                         <div className="mb-2">
//                             <p className="text-gray-700 font-semibold">Name: {student.name}</p>
//                             <p className="text-gray-700">Class: {student.class}</p>
//                             <p className="text-gray-700">Roll No: {student.rollNo}</p>
//                             <p className="text-gray-700">Adm No: {student.admissionNo}</p>
//                             <p className="text-gray-700">Father Name: {student.fatherName}</p>
//                             <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
//                             <p className="text-gray-700">Address: {student.address}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center">
//                         <div className="mr-4">
//                             <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" />
//                         </div>
//                         {/* Edit Icon Button */}
//                         <button
//                             className="text-blue-500 hover:text-blue-700 focus:outline-none"
//                             onClick={() => handleEditClick(index)}
//                         >
//                             <FaEdit size={20} />
//                         </button>
//                     </div>
//                 </div>
//             ))}


//             <Modal
//                 isOpen={modalOpen}
//                 setIsOpen={setModalOpen}
//                 title="Edit Student Information"
//                 onSave={handleSaveClick} // Pass the save function
//             >
//                 {/* Content of the modal (additional fields) */}
//                 {editingIndex !== null && (
//                     <div className="mt-4">
//                         {croppedImageSource ? (
//                             <div className='relative w-full aspect-square'>
//                                 <Cropper
//                                     image={croppedImageSource}
//                                     crop={crop}
//                                     zoom={zoom}
//                                     aspect={1}
//                                     onCropChange={setCrop}
//                                     onZoomChange={setZoom}
//                                     onCropComplete={onCropComplete}
//                                 />
//                                 <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
//                                     <button
//                                         onClick={cancelCrop}
//                                         className='bg-red-500 text-white py-2 px-4 rounded'>
//                                         Cancel Crop
//                                     </button>
//                                     <button
//                                         onClick={showCroppedImage}
//                                         className='bg-blue-500 text-white py-2 px-4 rounded'>
//                                         Crop Image
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {/* Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
//                                         Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="name"
//                                         name="name"
//                                         type="text"
//                                         placeholder="Name"
//                                         value={students[editingIndex].name}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>
//                                 {/* Class */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class">
//                                         Class:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="class"
//                                         name="class"
//                                         type="text"
//                                         placeholder="Class"
//                                         value={students[editingIndex].class}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Roll No */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rollNo">
//                                         Roll No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="rollNo"
//                                         name="rollNo"
//                                         type="text"
//                                         placeholder="Roll No"
//                                         value={students[editingIndex].rollNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                  {/* Admission No */}
//                                  <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admissionNo">
//                                         Admission No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="admissionNo"
//                                         name="admissionNo"
//                                         type="text"
//                                         placeholder="Admission No"
//                                         value={students[editingIndex].admissionNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                  {/* Father Name */}
//                                  <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherName">
//                                         Father Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherName"
//                                         name="fatherName"
//                                         type="text"
//                                         placeholder="Father Name"
//                                         value={students[editingIndex].fatherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mobile No */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNo">
//                                         Mobile No:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="mobileNo"
//                                         name="mobileNo"
//                                         type="text"
//                                         placeholder="Mobile No"
//                                         value={students[editingIndex].mobileNo}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Address */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
//                                         Address:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="address"
//                                         name="address"
//                                         type="text"
//                                         placeholder="Address"
//                                         value={students[editingIndex].address}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Student Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
//                                         Student Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="photo"
//                                         name="photo"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'photo')}
//                                         value={isEditingPhoto ? photoInputValue : ''}
//                                     />
//                                     {students[editingIndex].photo && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].photo}
//                                             alt="Student"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianName">
//                                         Guardian Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianName"
//                                         name="guardianName"
//                                         type="text"
//                                         placeholder="Guardian Name"
//                                         value={students[editingIndex].guardianName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Transport */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
//                                         Transport:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="transport"
//                                         name="transport"
//                                         type="text"
//                                         placeholder="Transport"
//                                         value={students[editingIndex].transport}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
//                                         Mother Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherName"
//                                         name="motherName"
//                                         type="text"
//                                         placeholder="Mother Name"
//                                         value={students[editingIndex].motherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
//                                         Mother Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherPhoto"
//                                         name="motherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}
//                                     />
//                                     {students[editingIndex].motherPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].motherPhoto}
//                                             alt="Mother"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Father Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
//                                         Father Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherPhoto"
//                                         name="fatherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}

//                                     />
//                                     {students[editingIndex].fatherPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].fatherPhoto}
//                                             alt="Father"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
//                                         Guardian Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianPhoto"
//                                         name="guardianPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
//                                         value={isEditingPhoto ? photoInputValue : ''}

//                                     />
//                                     {students[editingIndex].guardianPhoto && !croppedImageSource && (
//                                         <img
//                                             src={students[editingIndex].guardianPhoto}
//                                             alt="Guardian"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// }

// export default AllStudent;


// import React, { useState, useCallback } from 'react';
// import Cropper from 'react-easy-crop';
// import getCroppedImg from './getCroppedImg';
// import { FaEdit } from 'react-icons/fa'; // Import edit icon

// // Modal component (as before)
// const Modal = ({ isOpen, setIsOpen, title, children, onSave }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//                 <div className="mt-3 text-center">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//                     <div className="mt-2 px-7 py-3">
//                         {children}
//                     </div>
//                     <div className="items-center px-4 py-3">
//                         <button
//                             className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mr-2"
//                             onClick={onSave} // Call the onSave function
//                         >
//                             Save
//                         </button>
//                         <button
//                             className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                             onClick={() => setIsOpen(false)}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AllStudent() {
//     // Initial array of 10 student data objects
//     const initialStudents = Array(10).fill({
//         photo: 'https://via.placeholder.com/150', // Default placeholder image
//         name: 'John Doe',
//         class: '10th',
//         rollNo: '12345',
//         admissionNo: '67890',
//         fatherName: 'Mr. Smith',
//         mobileNo: '9876543210',
//         address: '123 Main Street, Anytown',
//         guardianName: '',
//         remarks: '',
//         transport: '',
//         motherName: '',
//         motherPhoto: null,
//         fatherPhoto: null,
//         guardianPhoto: null,
//     });

//     const [students, setStudents] = useState(initialStudents);

//     // State for the modal
//     const [modalOpen, setModalOpen] = useState(false);

//     // State to track the currently editing student index
//     const [editingIndex, setEditingIndex] = useState(null);

//     // State for the image cropping
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper

//     // New State added to identify the current Photo being changed
//     const [currentPhotoField, setCurrentPhotoField] = useState(null);

//     // Wrap state updates with useCallback
//     const setStudentsCallback = useCallback(setStudents, []);
//     const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
//     const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

//     // Function to handle input field changes (for the currently edited student)
//     const handleInputChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setStudentsCallback(prevStudents =>
//             prevStudents.map((student, index) =>
//                 index === editingIndex ? { ...student, [name]: value } : student
//             )
//         );
//     }, [editingIndex, setStudentsCallback]);

//     // Function to handle photo input changes (for the currently edited student)
//     const handlePhotoChange = useCallback((e, photoField) => {
//         const { files } = e.target;
//         setCurrentPhotoFieldCallback(photoField);
//         if (files && files[0]) {
//             const reader = new FileReader();
//             reader.onload = () => {
//                 setCroppedImageSourceCallback(reader.result);
//             };
//             reader.readAsDataURL(files[0]);
//         }
//     }, [setCroppedImageSourceCallback, setCurrentPhotoFieldCallback]);

//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const showCroppedImage = useCallback(async () => {
//         try {
//             if (!croppedImageSource || !croppedAreaPixels) {
//                 console.error("Cannot crop image: imageSrc or croppedAreaPixels is missing.");
//                 return;
//             }

//             const croppedImageURL = await getCroppedImg(croppedImageSource, croppedAreaPixels);

//             setCroppedImageSourceCallback(null); // Hide the Cropper
//             setStudentsCallback(prevStudents =>
//                 prevStudents.map((student, index) =>
//                     index === editingIndex ? { ...student, [currentPhotoField]: croppedImageURL } : student
//                 )
//             );
//             setCurrentPhotoFieldCallback(null);
//         } catch (error) {
//             console.error("Error cropping image:", error);
//         }
//     }, [croppedAreaPixels, croppedImageSource, editingIndex, currentPhotoField, setStudentsCallback, setCurrentPhotoFieldCallback, setCroppedImageSourceCallback]);

//     // Function to open the modal and set the editing index
//     const handleEditClick = useCallback((index) => {
//         setEditingIndex(index);
//         setModalOpen(true);
//     }, []);

//     // Function to save the changes and close the modal
//     const handleSaveClick = useCallback(() => {
//         setModalOpen(false);
//         setEditingIndex(null);

//         //persist the data to state
//         console.log("Saved students data:", students);
//     }, [students]);

//     return (
//         <div className="container mx-auto p-4">
//             {students.map((student, index) => (
//                 <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center justify-between">
//                     <div>
//                         <div className="mb-2">
//                             <p className="text-gray-700 font-semibold">Name: {student.name}</p>
//                             <p className="text-gray-700">Class: {student.class}</p>
//                             <p className="text-gray-700">Roll No: {student.rollNo}</p>
//                             <p className="text-gray-700">Adm No: {student.admissionNo}</p>
//                             <p className="text-gray-700">Father Name: {student.fatherName}</p>
//                             <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
//                             <p className="text-gray-700">Address: {student.address}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center">
//                         <div className="mr-4">
//                             <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" />
//                         </div>
//                          {/* Edit Icon Button */}
//                          <button
//                             className="text-blue-500 hover:text-blue-700 focus:outline-none"
//                             onClick={() => handleEditClick(index)}
//                         >
//                             <FaEdit size={20} />
//                         </button>
//                     </div>
//                 </div>
//             ))}


//             <Modal
//                 isOpen={modalOpen}
//                 setIsOpen={setModalOpen}
//                 title="Edit Student Information"
//                 onSave={handleSaveClick} // Pass the save function
//             >
//                 {/* Content of the modal (additional fields) */}
//                 {editingIndex !== null && (
//                     <div className="mt-4">
//                         {croppedImageSource ? (
//                             <div className='relative w-full aspect-square'>
//                                 <Cropper
//                                     image={croppedImageSource}
//                                     crop={crop}
//                                     zoom={zoom}
//                                     aspect={1}
//                                     onCropChange={setCrop}
//                                     onZoomChange={setZoom}
//                                     onCropComplete={onCropComplete}
//                                 />
//                                 <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
//                                     <button
//                                         onClick={() => setCroppedImageSource(null)}
//                                         className='bg-red-500 text-white py-2 px-4 rounded'>
//                                         Cancel Crop
//                                     </button>
//                                     <button
//                                         onClick={showCroppedImage}
//                                         className='bg-blue-500 text-white py-2 px-4 rounded'>
//                                         Crop Image
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {/* Guardian Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianName">
//                                         Guardian Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianName"
//                                         name="guardianName"
//                                         type="text"
//                                         placeholder="Guardian Name"
//                                         value={students[editingIndex].guardianName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Transport */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
//                                         Transport:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="transport"
//                                         name="transport"
//                                         type="text"
//                                         placeholder="Transport"
//                                         value={students[editingIndex].transport}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
//                                         Mother Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherName"
//                                         name="motherName"
//                                         type="text"
//                                         placeholder="Mother Name"
//                                         value={students[editingIndex].motherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
//                                         Mother Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherPhoto"
//                                         name="motherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
//                                     />
//                                     {students[editingIndex].motherPhoto && (
//                                         <img
//                                             src={students[editingIndex].motherPhoto}
//                                             alt="Mother"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Father Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
//                                         Father Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherPhoto"
//                                         name="fatherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
//                                     />
//                                     {students[editingIndex].fatherPhoto && (
//                                         <img
//                                             src={students[editingIndex].fatherPhoto}
//                                             alt="Father"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
//                                         Guardian Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianPhoto"
//                                         name="guardianPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
//                                     />
//                                     {students[editingIndex].guardianPhoto && (
//                                         <img
//                                             src={students[editingIndex].guardianPhoto}
//                                             alt="Guardian"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// }

// export default AllStudent;



// import React, { useState, useCallback } from 'react';
// import Cropper from 'react-easy-crop';
// import getCroppedImg from './getCroppedImg';

// // Modal component (as before)
// const Modal = ({ isOpen, setIsOpen, title, children, onSave }) => {
//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//                 <div className="mt-3 text-center">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//                     <div className="mt-2 px-7 py-3">
//                         {children}
//                     </div>
//                     <div className="items-center px-4 py-3">
//                         <button
//                             className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mr-2"
//                             onClick={onSave} // Call the onSave function
//                         >
//                             Save
//                         </button>
//                         <button
//                             className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                             onClick={() => setIsOpen(false)}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// function AllStudent() {
//     // Initial array of 10 student data objects
//     const initialStudents = Array(10).fill({
//         photo: 'https://via.placeholder.com/150', // Default placeholder image
//         name: 'John Doe',
//         class: '10th',
//         rollNo: '12345',
//         admissionNo: '67890',
//         fatherName: 'Mr. Smith',
//         mobileNo: '9876543210',
//         address: '123 Main Street, Anytown',
//         guardianName: '',
//         remarks: '',
//         transport: '',
//         motherName: '',
//         motherPhoto: null,
//         fatherPhoto: null,
//         guardianPhoto: null,
//     });

//     const [students, setStudents] = useState(initialStudents);

//     // State for the modal
//     const [modalOpen, setModalOpen] = useState(false);

//     // State to track the currently editing student index
//     const [editingIndex, setEditingIndex] = useState(null);

//     // State for the image cropping
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper

//     // New State added to identify the current Photo being changed
//     const [currentPhotoField, setCurrentPhotoField] = useState(null);

//     // Wrap state updates with useCallback
//     const setStudentsCallback = useCallback(setStudents, []);
//     const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
//     const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

//     // Function to handle input field changes (for the currently edited student)
//     const handleInputChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setStudentsCallback(prevStudents =>
//             prevStudents.map((student, index) =>
//                 index === editingIndex ? { ...student, [name]: value } : student
//             )
//         );
//     }, [editingIndex, setStudentsCallback]);

//     // Function to handle photo input changes (for the currently edited student)
//     const handlePhotoChange = useCallback((e, photoField) => {
//         const { files } = e.target;
//         setCurrentPhotoFieldCallback(photoField);
//         if (files && files[0]) {
//             const reader = new FileReader();
//             reader.onload = () => {
//                 setCroppedImageSourceCallback(reader.result);
//             };
//             reader.readAsDataURL(files[0]);
//         }
//     }, [setCroppedImageSourceCallback, setCurrentPhotoFieldCallback]);

//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const showCroppedImage = useCallback(async () => {
//         try {
//             if (!croppedImageSource || !croppedAreaPixels) {
//                 console.error("Cannot crop image: imageSrc or croppedAreaPixels is missing.");
//                 return;
//             }

//             const croppedImageURL = await getCroppedImg(croppedImageSource, croppedAreaPixels);

//             setCroppedImageSourceCallback(null); // Hide the Cropper
//             setStudentsCallback(prevStudents =>
//                 prevStudents.map((student, index) =>
//                     index === editingIndex ? { ...student, [currentPhotoField]: croppedImageURL } : student
//                 )
//             );
//             setCurrentPhotoFieldCallback(null);
//         } catch (error) {
//             console.error("Error cropping image:", error);
//         }
//     }, [croppedAreaPixels, croppedImageSource, editingIndex, currentPhotoField, setStudentsCallback, setCurrentPhotoFieldCallback, setCroppedImageSourceCallback]);

//     // Function to open the modal and set the editing index
//     const handleAddClick = useCallback((index) => {
//         setEditingIndex(index);
//         setModalOpen(true);
//     }, []);

//     // Function to save the changes and close the modal
//     const handleSaveClick = useCallback(() => {
//         setModalOpen(false);
//         setEditingIndex(null);

//         //persist the data to state
//         console.log("Saved students data:", students);
//     }, [students]);

//     return (
//         <div className="container mx-auto p-4">
//             {students.map((student, index) => (
//                 <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center">
                
//                 <div>
//                     <div className="mb-2">
//                         <p className="text-gray-700 font-semibold">Name: {student.name}</p>
//                         <p className="text-gray-700">Class: {student.class}</p>
//                         <p className="text-gray-700">Roll No: {student.rollNo}</p>
//                         <p className="text-gray-700">Adm No: {student.admissionNo}</p>
//                         <p className="text-gray-700">Father Name: {student.fatherName}</p>
//                         <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
//                         <p className="text-gray-700">Address: {student.address}</p>
//                     </div>
            
                   
//                     <button
//                         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                         type="button"
//                         onClick={() => handleAddClick(index)} // Open modal for this student
//                     >
//                         Add More Info
//                     </button>
//                 </div>
//                 <div className="mr-4"> 
//                     <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" /> {/* w-24 = 6rem = 96px (close to 100px), h-24 for square */}
//                 </div>
//             </div>
                
//             ))}

         
//             <Modal
//                 isOpen={modalOpen}
//                 setIsOpen={setModalOpen}
//                 title="Additional Information"
//                 onSave={handleSaveClick} // Pass the save function
//             >
//                 {/* Content of the modal (additional fields) */}
//                 {editingIndex !== null && (
//                     <div className="mt-4">
//                         {croppedImageSource ? (
//                             <div className='relative w-full aspect-square'>
//                                 <Cropper
//                                     image={croppedImageSource}
//                                     crop={crop}
//                                     zoom={zoom}
//                                     aspect={1}
//                                     onCropChange={setCrop}
//                                     onZoomChange={setZoom}
//                                     onCropComplete={onCropComplete}
//                                 />
//                                 <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
//                                     <button
//                                         onClick={() => setCroppedImageSource(null)}
//                                         className='bg-red-500 text-white py-2 px-4 rounded'>
//                                         Cancel Crop
//                                     </button>
//                                     <button
//                                         onClick={showCroppedImage}
//                                         className='bg-blue-500 text-white py-2 px-4 rounded'>
//                                         Crop Image
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {/* Guardian Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianName">
//                                         Guardian Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianName"
//                                         name="guardianName"
//                                         type="text"
//                                         placeholder="Guardian Name"
//                                         value={students[editingIndex].guardianName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

                               

//                                 {/* Transport */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
//                                         Transport:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="transport"
//                                         name="transport"
//                                         type="text"
//                                         placeholder="Transport"
//                                         value={students[editingIndex].transport}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Name */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
//                                         Mother Name:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherName"
//                                         name="motherName"
//                                         type="text"
//                                         placeholder="Mother Name"
//                                         value={students[editingIndex].motherName}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>

//                                 {/* Mother Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
//                                         Mother Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="motherPhoto"
//                                         name="motherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
//                                     />
//                                     {students[editingIndex].motherPhoto && (
//                                         <img
//                                             src={students[editingIndex].motherPhoto}
//                                             alt="Mother"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Father Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
//                                         Father Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="fatherPhoto"
//                                         name="fatherPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
//                                     />
//                                     {students[editingIndex].fatherPhoto && (
//                                         <img
//                                             src={students[editingIndex].fatherPhoto}
//                                             alt="Father"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>

//                                 {/* Guardian Photo */}
//                                 <div className="mb-2">
//                                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
//                                         Guardian Photo:
//                                     </label>
//                                     <input
//                                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                                         id="guardianPhoto"
//                                         name="guardianPhoto"
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment" // Use the camera to capture
//                                         onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
//                                     />
//                                     {students[editingIndex].guardianPhoto && (
//                                         <img
//                                             src={students[editingIndex].guardianPhoto}
//                                             alt="Guardian"
//                                             className="rounded-sm w-20 h-20 object-cover mt-2"
//                                         />
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </div>
//     );
// }

// export default AllStudent;

