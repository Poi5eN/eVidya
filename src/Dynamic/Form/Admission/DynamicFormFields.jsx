import React, { useState, useCallback } from 'react';
import { X, Calendar, Camera } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg';
// import { Admission } from '../Network/ThirdPartyApi';


import Modal from '../../Modal';

function DynamicFormFileds({ student ,setStudent}) {
    const schoolID = localStorage.getItem("SchoolID");
    const [modalOpen, setModalOpen] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImageSource, setCroppedImageSource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPhotoType, setCurrentPhotoType] = useState(null); // new state

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e, photoType) => {
        const file = e.target.files?.[0];

        if (file) {
            setCurrentPhotoType(photoType);  // Set the type (father, mother, guardian)
            const reader = new FileReader();
            reader.onload = () => {
                setCroppedImageSource(reader.result); // set the cropped image source to reader result for cropping purpose
            };
            reader.readAsDataURL(file);
        }
    };
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const cancelCrop = useCallback(() => {
        setCroppedImageSource(null);
    }, [setCroppedImageSource]);

    const showCroppedImage = async () => {
        try {
            const croppedImageUrl = await getCroppedImg(croppedImageSource, croppedAreaPixels);
            setCroppedImageSource(null);
            switch (currentPhotoType) {
                case 'father':
                    setStudent(prev => ({ ...prev, fatherPhoto: croppedImageUrl }));
                    break;
                case 'mother':
                    setStudent(prev => ({ ...prev, motherPhoto: croppedImageUrl }));
                    break;
                case 'guardian':
                    setStudent(prev => ({ ...prev, guardianPhoto: croppedImageUrl }));
                    break;
                default:
                    setStudent(prev => ({ ...prev, photo: croppedImageUrl })); // Main photo
                    break;
            }
            setCurrentPhotoType(null);

        } catch (error) {
            console.error("Error cropping image:", error);
        }
    };


    const handleMoreDetails = () => {
        setModalOpen(true);
    }
    if (croppedImageSource) {
        return (

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-4 w-full max-w-md">
                    <div className="relative h-64 w-full">
                        <Cropper
                            image={croppedImageSource}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setCroppedImageSource(null)}
                            className="px-4 py-2 bg-gray-200 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={showCroppedImage}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                            Crop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full max-w-md bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Student Details</h2>
                    <button
                        onClick={() => handleMoreDetails()}
                        className="text-gray-500">
                        More Details
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {student.photo ? (
                            <img
                                src={student.photo}
                                alt="Student"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-400">NO IMAGE</span>
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                            <Camera size={16} />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(e, 'student')}
                            />
                        </label>
                    </div>
                </div>
                <div className="space-y-4">
                    <input
                        type="text"
                        name="admissionNo"
                        placeholder="Enter Admission No."
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.admissionNo}
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        name="rollNo"
                        placeholder="Enter Roll Number"
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.rollNo}
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Student Name"
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.name}
                        onChange={handleInputChange}
                        required
                    />
                   

                    <select
                        name="class"
                        className="w-full px-3 py-2 border rounded-md text-gray-600"
                        value={student.class}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Class</option>
                        <option value="1">Class 1</option>
                        <option value="2">Class 2</option>
                        <option value="3">Class 3</option>
                    </select>

                    <select
                        name="section"
                        className="w-full px-3 py-2 border rounded-md text-gray-600"
                        value={student.section}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Section</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                    </select>
                    <select
                        name="gender"
                        className="w-full px-3 py-2 border rounded-md text-gray-600"
                        value={student.gender}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    <div className="relative">
                        <input
                            type="date"
                            name="dob"
                            placeholder='DOB'
                            className="w-full px-3 py-2 border rounded-md"
                            value={student.dob}
                            onChange={handleInputChange}
                        />
                        <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
                    </div>

                    <input
                        type="text"
                        name="fatherName"
                        placeholder="Enter Father Name"
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.fatherName}
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        name="contact"
                        placeholder="Contact No."
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.contact}
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        name="address"
                        placeholder="Enter Address"
                        className="w-full px-3 py-2 border rounded-md"
                        value={student.address}
                        onChange={handleInputChange}
                    />
                  
                </div>

            </div>
            <Modal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                title={`More Details`}
            >

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
                    <div className='px-4 pb-2'>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                Guardian Name:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="guardianName"
                                name="guardianName"
                                type="text"
                                placeholder="Guardian Name"
                                onChange={handleInputChange}
                                value={student.guardianName}
                            />
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
                                value={student.transport}
                                onChange={handleInputChange}
                            />
                           
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                            Remarks:
                            </label>
                            
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="remarks"
                                name="remarks"
                                type="text"
                                placeholder="Remarks"
                                value={student.remarks}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                    Father Photo:
                                </label>
                                {student.fatherPhoto ? (
                                    <img
                                        src={student.fatherPhoto}
                                        alt="Student"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-gray-400">NO IMAGE</span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoChange(e, 'father')}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                    Mother Photo:
                                </label>
                                {student.motherPhoto ? (
                                    <img
                                        src={student.motherPhoto}
                                        alt="Student"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-gray-400">NO IMAGE</span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoChange(e, 'mother')}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                    Guardian Photo:
                                </label>
                                {student.guardianPhoto ? (
                                    <img
                                        src={student.guardianPhoto}
                                        alt="Student"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-gray-400">NO IMAGE</span>
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoChange(e, 'guardian')}
                                    />
                                </label>
                            </div>
                        </div>


                    </div>
                )}
            </Modal>
        </>
    );
}

export default DynamicFormFileds;