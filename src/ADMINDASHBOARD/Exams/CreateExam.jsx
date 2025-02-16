import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaPlus, FaTimesCircle } from "react-icons/fa";
import Select from "react-select";
import Heading2 from "../../Dynamic/Heading2";
import ViewExam from "./AllExams/ViewExam";
export default function CreateExam() {
    const { currentColor } = useStateContext();
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [examId, setExamId] = useState(null);
    const [examCreated, setExamCreated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalFormData, setModalFormData] = useState({
        examName: "",
        examType: "",
        className: "",
        section: "",
        startDate: "",
        endDate: "",
        Grade: "",
        resultPublishDate: "",
        subjects: [],
    });

    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const authToken = Cookies.get("token");

    useEffect(() => {
        if (showForm) {
            fetchAllClasses();
        }
        
    }, [showForm]);

    const handleEditExam = (exam) => {
        console.log("exam", exam);
        setEditMode(true);
        setExamId(exam?._id);
        setShowForm(true);
        setModalFormData({
            examName: exam?.name || "",
            examType: exam?.examType || "",
            className: exam?.className || "",
            section: exam?.section || "",
            startDate: exam?.startDate || "",
            endDate: exam?.endDate || "",
            Grade: exam?.gradeSystem || "",
            resultPublishDate: exam?.resultPublishDate || "",
            subjects:
                exam?.subjects?.map((subject) => ({
                    name: subject?.name,
                    examDate: subject?.examDate,
                    startTime: subject?.startTime,
                    endTime: subject?.endTime,
                    totalMarks: subject?.totalMarks,
                    passingMarks: subject?.passingMarks,
                    selectedMonths: subject?.selectedMonths || [],
                })) || [],
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setModalFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubjectChange = (index, field, value) => {
        setModalFormData((prevData) => {
            const updatedSubjects = [...prevData.subjects];
            updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
            return { ...prevData, subjects: updatedSubjects };
        });
    };

    const fetchAllClasses = async () => {
        try {
            const response = await axios.get(
                "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (response?.data?.success) {
                const classes = response?.data.classList.map((item) => ({
                    value: item._id,
                    label: item.className,
                    subjects: item.subjects,
                }));
                setAvailableClasses(classes);
            } else {
                toast.error("Failed to fetch class list.");
                setAvailableClasses([]);
            }
        } catch (error) {
            console.error("Error fetching class list:", error);
            toast.error("Error fetching class list.");
            setAvailableClasses([]);
        }
    };

    const handleClassSelect = (selectedOption) => {
        setSelectedClass(selectedOption);
        const subjectsString = selectedOption.subjects;
        const subjectsArray = subjectsString
            ? subjectsString.split(",").map((s) => s.trim())
            : [];
        const subjectsOptions = subjectsArray.map((subject) => ({
            value: subject,
            label: subject,
        }));

        setAvailableSubjectsForClass(subjectsOptions);
        setModalFormData((prevData) => ({
            ...prevData,
            className: selectedOption.label,
        }));
    };

    const handleSubjectsSelect = (selectedOptions) => {
        setSelectedSubjects(selectedOptions);
        const newSubjects = selectedOptions.map((subject) => ({
            name: subject.label,
            examDate: "",
            startTime: "",
            endTime: "",
            totalMarks: "",
            passingMarks: "",
            selectedMonths: [],
        }));

        setModalFormData((prevData) => ({
            ...prevData,
            subjects: newSubjects,
        }));
    };
    const handleOpenForm = () => {
        setShowForm(true);
        setEditMode(false);
        setModalFormData({
            examName: "",
            examType: "",
            className: "",
            section: "",
            startDate: "",
            endDate: "",
            Grade: "",
            resultPublishDate: "",
            subjects: [],
        });
        setSelectedSubjects([]);
        setSelectedClass(null);
        setAvailableSubjectsForClass([]);
    };

    const handleSubmit = async (e) => {
        console.log("modalFormData", modalFormData)
        e.preventDefault();
        setLoading(true);
        if (
            !modalFormData?.examName ||
            !modalFormData?.examType ||
            !modalFormData?.className ||
            !modalFormData?.Grade ||
            !modalFormData?.startDate ||
            !modalFormData?.endDate ||
            !modalFormData?.resultPublishDate ||
            modalFormData?.subjects?.length === 0
        ) {
            toast.error(
                "Please fill in all the required fields and select at least one subject!"
            );
            setLoading(false);
            return;
        }
        let payload = {
            name: modalFormData?.examName,
            examType: modalFormData?.examType,
            className: modalFormData?.className,
            section: "A",
            gradeSystem: modalFormData?.Grade,
            startDate: modalFormData?.startDate,
            endDate: modalFormData?.endDate,
            resultPublishDate: modalFormData?.resultPublishDate,
            subjects: modalFormData?.subjects,
        };

        let apiUrl = "https://eserver-i5sm.onrender.com/api/v1/exam/createExams";
        let method = "post";
        if (editMode) {
            apiUrl = `https://eserver-i5sm.onrender.com/api/v1/exam/updateExam/${examId}`;
            method = "put";
        }
        try {
            await axios[method](apiUrl, payload, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });
            setModalFormData({
                examName: "",
                examType: "",
                className: "",
                section: "",
                startDate: "",
                endDate: "",
                Grade: "",
                resultPublishDate: "",
                subjects: [],
            });
            setEditMode(false);
            setExamId(null);
            toast.success(
                editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!"
            );
            setExamCreated(!examCreated);
            setLoading(false);
            setShowForm(false);
            setSelectedClass(null);
            setSelectedSubjects([]);
            setAvailableSubjectsForClass([]);
        } catch (error) {
            setLoading(false);
            console.log("error", error);
            toast.error(
                `Error: ${error?.response?.data?.message || "Something went wrong!"}`
            );
        }
    };

    return (
        <div className="px-5">
            <Heading2 title={"All EXAMS"}>
                <button
                    onClick={handleOpenForm}
                    className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
                    style={{ background: currentColor }}
                >
                    {" "}
                    <FaPlus />
                    <span>Create Exam</span>
                </button>
            </Heading2>

            {showForm ? (
                <div className=" mx-auto bg-gray-50 p-6  ">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div
                            className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
                        >
                            <div>
                                <label htmlFor="examName" className="block text-gray-700 text-sm font-bold mb-2">Exam Name:</label>
                                <input
                                    type="text"
                                    id="examName"
                                    name="examName"
                                    required={true}
                                    onChange={handleInputChange}
                                    value={modalFormData?.examName}
                                    placeholder="Exam Name"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
                                />
                            </div>

                            <div>
                                <label htmlFor="examType" className="block text-gray-700 text-sm font-bold mb-2">Exam Type:</label>
                                <div className="flex flex-col space-y-1 mt-1">
                                    <select
                                        id="examType"
                                        name="examType"
                                        value={modalFormData?.examType}
                                        onChange={handleInputChange}
                                        required
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
                                    >
                                        <option value="">Select Exam Type</option>
                                        <option value="TERM">Term</option>
                                        <option value="UNIT_TEST">Unit Test</option>
                                        <option value="FINAL">Final</option>
                                        <option value="ENTRANCE">Entrance</option>
                                        <option value="COMPETITIVE">Competitive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Grade" className="block text-gray-700 text-sm font-bold mb-2">Grade System:</label>
                                <select
                                    id="Grade"
                                    name="Grade"
                                    value={modalFormData?.Grade}
                                    onChange={handleInputChange}
                                    required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                >
                                    <option value="">Grade System</option>
                                    <option value="Percentage">Percentage</option>
                                    <option value="Grade">Grade</option>
                                    <option value="CGPA">CGPA</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    required={true}
                                    onChange={handleInputChange}
                                    value={modalFormData?.startDate}
                                    placeholder=" Start Date"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    required={true}
                                    onChange={handleInputChange}
                                    value={modalFormData?.endDate}
                                    placeholder="End Date"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                />
                            </div>

                            <div>
                                <label htmlFor="resultPublishDate" className="block text-gray-700 text-sm font-bold mb-2">Result Publish Date:</label>
                                <input
                                    type="date"
                                    id="resultPublishDate"
                                    name="resultPublishDate"
                                    required={true}
                                    onChange={handleInputChange}
                                    value={modalFormData?.resultPublishDate}
                                    placeholder="Result Publish Date"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Select Class
                                    </h3>
                                </div>

                                <Select
                                    options={availableClasses}
                                    value={selectedClass}
                                    onChange={handleClassSelect}
                                    placeholder="Select a Class"
                                    isSearchable
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    styles={{  // Custom Styling for react-select
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(0, 0, 0, 0.1)' : baseStyles.boxShadow,
                                            border: 'none',
                                            outline: 'none',
                                            borderRadius: '0.25rem',
                                            '&:hover': {
                                                borderColor: state.isFocused ? 'rgba(0, 0, 0, 0.2)' : baseStyles.borderColor,
                                            },
                                        }),
                                        menu: baseStyles => ({ ...baseStyles, zIndex: 10 }) // Ensure menu overlays other content
                                    }}

                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Select Subjects
                                    </h3>
                                </div>

                                <Select
                                    options={availableSubjectsForClass}
                                    value={selectedSubjects}
                                    onChange={handleSubjectsSelect}
                                    placeholder="Select Subjects"
                                    isMulti
                                    isSearchable
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    styles={{  // Custom Styling for react-select
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(0, 0, 0, 0.1)' : baseStyles.boxShadow,
                                            border: 'none',
                                            outline: 'none',
                                            borderRadius: '0.25rem',
                                            '&:hover': {
                                                borderColor: state.isFocused ? 'rgba(0, 0, 0, 0.2)' : baseStyles.borderColor,
                                            },
                                        }),
                                        menu: baseStyles => ({ ...baseStyles, zIndex: 10 }) // Ensure menu overlays other content
                                    }}
                                />
                            </div>
                        </div>

                        {modalFormData?.subjects?.map((subject, index) => (
                            <div
                                key={index}
                                className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
                            >
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">{subject?.name}</label>
                                </div>

                                <div>
                                    <label htmlFor={`examDate-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Exam Date:</label>
                                    <input
                                        type="date"
                                        id={`examDate-${index}`}
                                        name="examDate"
                                        required={true}
                                        onChange={(e) =>
                                            handleSubjectChange(index, "examDate", e.target.value)
                                        }
                                        value={subject?.examDate}
                                        placeholder="Exam Date"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`startTime-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Start Time:</label>
                                    <input
                                        type="time"
                                        id={`startTime-${index}`}
                                        name="startTime"
                                        required={true}
                                        onChange={(e) =>
                                            handleSubjectChange(index, "startTime", e.target.value)
                                        }
                                        value={subject?.startTime}
                                        placeholder="Start Time"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`endTime-${index}`} className="block text-gray-700 text-sm font-bold mb-2">End Time:</label>
                                    <input
                                        type="time"
                                        id={`endTime-${index}`}
                                        name="endTime"
                                        required={true}
                                        onChange={(e) =>
                                            handleSubjectChange(index, "endTime", e.target.value)
                                        }
                                        value={subject?.endTime}
                                        placeholder="End Time"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`totalMarks-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Total Marks:</label>
                                    <input
                                        type="number"
                                        id={`totalMarks-${index}`}
                                        name="totalMarks"
                                        required={true}
                                        onChange={(e) =>
                                            handleSubjectChange(index, "totalMarks", e.target.value)
                                        }
                                        value={subject.totalMarks}
                                        placeholder="Total Marks"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`passingMarks-${index}`} className="block text-gray-700 text-sm font-bold mb-2">Passing Marks:</label>
                                    <input
                                        type="number"
                                        id={`passingMarks-${index}`}
                                        name="passingMarks"
                                        required={true}
                                        onChange={(e) =>
                                            handleSubjectChange(index, "passingMarks", e.target.value)
                                        }
                                        value={subject.passingMarks}
                                        placeholder="Passing Marks"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"  // Custom styling
                                    />
                                </div>

                            </div>
                        ))}

                      <div className="flex items-center justify-center gap-2">
                      <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading
                                ? editMode
                                    ? "Updating Exam..."
                                    : "Saving Exam..."
                                : editMode
                                    ? "Update Exam"
                                    : "Save Exam"}
                        </button>
                        <button
                                type="button"
                                onClick={()=>setShowForm(false)}
                                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md focus:outline-none"
                            >
                                Cancel
                            </button>
                      </div>
                    </form>
                </div>
            ):(<ViewExam/>)
            }
        </div>
    );
}

