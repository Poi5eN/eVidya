import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { LastYearStudents, AdminGetAllClasses } from "../../Network/AdminApi";

const calculateGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "F";
};

const ReportCard = () => {
    const [getClass, setGetClass] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [availableSections, setAvailableSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(""); // Add this line
    const [allStudents, setAllStudents] = useState([]);
    const [examName, setExamName] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [marks, setMarks] = useState([]);
    const [examData, setExamData] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);
    const [coScholasticMarks, setCoScholasticMarks] = useState([]);
    const [overallData, setOverallData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

    const schoolImage = sessionStorage.getItem("schoolImage");
    const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

    const { currentColor } = useStateContext();
    const componentPDF = useRef();
    const authToken = Cookies.get("token");

    const generatePDF = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: `${
            isAllStudentsSelected
                ? "All_Students_Report_Cards"
                : selectedStudent?.fullName || "Student"
        }_Report_Card`,
        onAfterPrint: () => toast.success("Downloaded successfully"),
    });

    const allStudent = async () => {
        try {
            const response = await LastYearStudents();
            if (response?.allStudent) {
                const filterStudent = response?.allStudent.filter(
                    (val) => val.class === selectedClass && val.section === selectedSection
                );
                setAllStudents(filterStudent ? filterStudent : response?.allStudent);
            }
        } catch (error) {
            console.error("Error fetching students:", error); //Add this
        }
    };

    useEffect(() => {
        allStudent();
    }, [selectedClass, selectedSection]);

    const getClasses = async () => {
        try {
            const response = await AdminGetAllClasses();
            if (response) {
                let classes = response?.classList;
                setGetClass(classes.sort((a, b) => a - b));
            }
        } catch (error) {
            console.error("Error fetching classes:", error); //Add this
        }
    };

    useEffect(() => {
        getClasses();
    }, []);

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
            setSelectedSection(""); //Also reset section when class changes
        }
    };

    const handleSectionChange = (e) => {
        setSelectedSection(e.target.value);
    };

    const getResult = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            setMarks(response.data.marks);
        } catch (error) {
            console.error("Error fetching marks:", error);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        getResult();
    }, [getResult]);

    const fetchExams = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const filterExam = response?.data?.exams?.filter(
                (val) =>
                    val?.className?.trim()?.toLowerCase() ===
                    selectedClass?.trim()?.toLowerCase()
            );
            setExamData(filterExam || []); // Use filtered exams, ensure it's an array
        } catch (error) {
            console.error("Error fetching exams:", error);
            setExamData([]); // Also set examData to empty array on error to avoid issues
        }
    }, [authToken, selectedClass]);

    useEffect(() => {
        if (selectedClass) { // Only fetch exams if a class is selected
            fetchExams();
        } else {
            setExamData([]); //Clear exams if no class is selected
        }
    }, [selectedClass, fetchExams]);

    // Function to calculate overall result data
    const calculateOverallData = useCallback((filteredMarks) => {
        if (!filteredMarks || filteredMarks.length === 0) {
            return {};
        }

        const overall = filteredMarks.reduce((acc, curr) => {
            if (curr && curr.marks) {
                curr.marks.forEach((mark) => {
                    acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
                    acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;
                });
            }

            return acc;
        }, { totalMarks: 0, totalPossibleMarks: 0 });

        const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
        const grade = calculateGrade(percentage);

        return {
            totalMarks: overall.totalMarks,
            totalPossibleMarks: overall.totalPossibleMarks,
            percentage,
            grade,
            isPassed: percentage >= 35,
        };
    }, []);

    useEffect(() => {
        if (!selectedStudent || marks.length === 0) {
            setExamResults([]);
            setCoScholasticMarks([]);
            setOverallData({});
            return;
        }

        if (isAllStudentsSelected) {
            setExamResults([]);
            setCoScholasticMarks([]);
            setOverallData({});
            return;
        }

        const studentMarks = marks.filter(
            (mark) => mark?.studentId?._id === selectedStudent?._id
        );

        const filteredMarks = studentMarks.filter((mark) =>
            selectedExams.includes(mark.examId)
        );

        const combinedResults = filteredMarks.reduce((acc, curr) => {
            curr.marks.forEach((mark) => {
                const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
                if (!existingMark) {
                    acc?.push({
                        ...mark,
                        examResults: [
                            {
                                examId: curr.examId,
                                marks: mark.marks,
                                totalMarks: mark.totalMarks,
                            },
                        ],
                    });
                } else {
                    existingMark.examResults = [
                        ...existingMark.examResults,
                        {
                            examId: curr.examId,
                            marks: mark.marks,
                            totalMarks: mark.totalMarks,
                        },
                    ];
                }
            });
            return acc;
        }, []);

        setExamResults({ marks: combinedResults });

        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
        const lastSelectedExamMarks = filteredMarks.find(
            (mark) => mark.examId === lastSelectedExamId
        );

        const coScholasticData = lastSelectedExamMarks
            ? lastSelectedExamMarks.coScholasticMarks
            : [];

        setCoScholasticMarks(coScholasticData);
        setOverallData(calculateOverallData(filteredMarks));

        const updatedExamNames = examData
            .filter((ex) => selectedExams.includes(ex._id))
            .map((ex) => ex.name);
        setExamName(updatedExamNames.reverse());

    }, [marks, selectedStudent, selectedExams, isAllStudentsSelected, calculateOverallData, examData]);

    const handleCheckboxChange = (exam) => {
        setSelectedExams((prevSelected) => {
            const isExamSelected = prevSelected.includes(exam._id);
            let updatedSelectedExams;

            if (isExamSelected) {
                updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
            } else {
                updatedSelectedExams = [...prevSelected, exam._id];
            }
            return updatedSelectedExams;
        });
    };

    const handleStudentChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "all") {
            setSelectedStudent(null);
            setIsAllStudentsSelected(true);
        } else {
            const selected = allStudents.find(
                (student) => student?._id === selectedValue
            );
            setSelectedStudent(selected);
            setIsAllStudentsSelected(false);
        }
    };

    const renderReportCard = (student) => {
        const studentMarks = marks.filter(
            (mark) => mark?.studentId?._id === student?._id
        );
        const filteredMarks = studentMarks.filter((mark) =>
            selectedExams.includes(mark.examId)
        );

        const combinedResults = filteredMarks.reduce((acc, curr) => {
            curr.marks.forEach((mark) => {
                const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
                if (!existingMark) {
                    acc?.push({
                        ...mark,
                        examResults: [
                            {
                                examId: curr.examId,
                                marks: mark.marks,
                                totalMarks: mark.totalMarks,
                            },
                        ],
                    });
                } else {
                    existingMark.examResults = [
                        ...existingMark.examResults,
                        {
                            examId: curr.examId,
                            marks: mark.marks,
                            totalMarks: mark.totalMarks,
                        },
                    ];
                }
            });
            return acc;
        }, []);

        const examResultsData = { marks: combinedResults };

        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
        const lastSelectedExamMarks = filteredMarks.find(
            (mark) => mark.examId === lastSelectedExamId
        );

        const coScholasticData = lastSelectedExamMarks
            ? lastSelectedExamMarks.coScholasticMarks
            : [];


        const overAll = calculateOverallData(filteredMarks);

        const term1Exams = selectedExams.slice(0, 3);
        const term2Exams = selectedExams.slice(3, 6);
        const showTerm2 = selectedExams.length >= 4;
        // Calculate overall totals
        let overallTotalMarks = 0;
        let overallTotalPossibleMarks = 0;
        examResultsData?.marks?.forEach((subject) => {
            const subjectTotalMarks = subject?.examResults?.reduce(
                (sum, result) => sum + (result?.marks || 0),
                0
            );
            const subjectTotalPossible = subject?.examResults?.reduce(
                (sum, result) => sum + (result?.totalMarks || 0),
                0
            );
            overallTotalMarks += subjectTotalMarks;
            overallTotalPossibleMarks += subjectTotalPossible;
        });
        const overallPercentage =
            overallTotalPossibleMarks > 0
                ? (overallTotalMarks / overallTotalPossibleMarks) * 100
                : 0;
        const overallGrade = calculateGrade(overallPercentage);

        // Calculate overall term totals
        let term1OverallTotalMarks = 0;
        let term1OverallTotalPossibleMarks = 0;
        term1Exams.forEach((examId) => {
            examResultsData?.marks?.forEach(subject => {
                const examResult = subject.examResults.find(res => res.examId === examId);
                if (examResult) {
                    term1OverallTotalMarks += examResult.marks;
                    term1OverallTotalPossibleMarks += examResult.totalMarks;
                }

            });
        });
        let term2OverallTotalMarks = 0;
        let term2OverallTotalPossibleMarks = 0;
        term2Exams.forEach((examId) => {
            examResultsData?.marks?.forEach(subject => {
                const examResult = subject.examResults.find(res => res.examId === examId);
                if (examResult) {
                    term2OverallTotalMarks += examResult.marks;
                    term2OverallTotalPossibleMarks += examResult.totalMarks;
                }
            });
        });
        return (
            // <div className="flex justify-center items-center p-2 sm:p-3" key={student?._id}>
            //     <div className="w-[190mm] sm:w-[210mm]  mx-auto">
            //         <div className="bg-white border-2 border-black py-1 sm:py-2  px-1 sm:px-3">
            //             <div className="  px-1 py-2 sm:py-8">
            //                 <div className="flex items-center justify-between mb-2 sm:mb-6 flex-wrap">
            //                     <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px]">
            <div className="flex justify-center items-center p-3">
            <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
                <div className=" bg-white border-2 border-black  py-2  px-3">
                    {/* <div className=" bg-white border  py-8 bg-red-300 px-3"> */}
                    <div className=" px-1 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-[70px] w-[70px]">
                                    <img
                                        src={schoolImage}
                                        alt="School Logo"
                                        className="w-full object-contain"
                                    />
                                </div>
                                <div className="text-center flex-1">
                                    <h1 className="text-red-600 font-bold text-xl sm:text-3xl">
                                        {SchoolDetails?.schoolName}
                                    </h1>
                                    <p className="text-blue-600 text-sm sm:text-xl">
                                        {SchoolDetails?.address}
                                    </p>
                                    <p className="text-green-600 text-xs sm:text-sm font-bold">
                                        {SchoolDetails?.email}
                                    </p>
                                    <p className="text-green-600 text-xs sm:text-sm font-bold">
                                        {SchoolDetails?.contact}
                                    </p>
                                </div>
                                <div className="w-[50px] sm:w-[70px]"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border p-1 sm:p-2 mb-1">
                                <div>
                                    <table className=" text-xs sm:text-sm">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Admission No. :
                                                </td>
                                                <td className="whitespace-nowrap to-blue-700 font-semibold">
                                                    {student?.admissionNumber || "N/A"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Student's Name :
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {student?.fullName || "N/A"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Father's Name :
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {student?.fatherName || "N/A"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Mother's Name :
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {student?.motherName || "N/A"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <table className="ml-3 text-xs sm:text-sm">
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Class :
                                                </td>
                                                <td>
                                                    {student?.class || "N/A"}-
                                                    {student?.section || ""}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold py-1 whitespace-nowrap">
                                                    Roll No. :
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {student?.rollNo || "N/A"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold py-1">DOB :</td>
                                                <td>
                                                    {student?.dateOfBirth
                                                        ? new Date(student.dateOfBirth).toLocaleDateString(
                                                            "en-GB",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            }
                                                        )
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end ">
                                    <img
                                        src={
                                            student?.image?.url ||
                                            "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                                        }
                                        alt="Student"
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 "
                                    />
                                </div>
                            </div>

                            <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th
                                            colSpan="4"
                                            className="border border-l border-gray-300 p-1 sm:p-2 text-center"
                                        >
                                            TERM-I
                                        </th>
                                        {showTerm2 && (
                                            <th
                                                colSpan="4"
                                                className="border border-gray-300 p-1 sm:p-2 text-center"
                                            >
                                                TERM-II
                                            </th>
                                        )}
                                        <th
                                            colSpan={term1Exams.length}
                                            className="border border-gray-300 p-1 sm:p-2 text-center"
                                        >
                                            GRAND TOTAL
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-1 sm:p-2">SUBJECTS</th>
                                        {term1Exams.map((examId) => {
                                            const exam = examData.find((ex) => ex._id === examId);
                                            return (
                                                exam && (
                                                    <th key={examId} className="border border-gray-300 p-1 sm:p-2">
                                                        {exam.name}
                                                    </th>
                                                )
                                            );
                                        })}
                                        {term1Exams.length > 0 ? (
                                            <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
                                        ) : null}
                                        {showTerm2 &&
                                            term2Exams.map((examId) => {
                                                const exam = examData.find((ex) => ex._id === examId);
                                                return (
                                                    exam && (
                                                        <th key={examId} className="border border-gray-300 p-1 sm:p-2">
                                                            {exam.name}
                                                        </th>
                                                    )
                                                );
                                            })}
                                        {showTerm2 && term2Exams.length > 0 ? (
                                            <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
                                        ) : null}
                                        <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
                                        <th className="border border-gray-300 p-1 sm:p-2">%</th>
                                        <th className="border border-gray-300 p-1 sm:p-2">GRADE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examResultsData?.marks?.map((subject, index) => {
                                        let term1TotalMarks = 0;
                                        let term1TotalPossibleMarks = 0;
                                        term1Exams.forEach((examId) => {
                                            const examResult = subject.examResults.find(res => res.examId === examId);
                                            if (examResult) {
                                                term1TotalMarks += examResult.marks;
                                                term1TotalPossibleMarks += examResult.totalMarks;
                                            }
                                        });
                                        let term2TotalMarks = 0;
                                        let term2TotalPossibleMarks = 0;
                                        term2Exams.forEach((examId) => {
                                            const examResult = subject.examResults.find(res => res.examId === examId);
                                            if (examResult) {
                                                term2TotalMarks += examResult.marks;
                                                term2TotalPossibleMarks += examResult.totalMarks;
                                            }
                                        });
                                        const totalMarks = subject?.examResults?.reduce(
                                            (sum, result) => sum + (result?.marks || 0),
                                            0
                                        );
                                        const totalPossible = subject?.examResults?.reduce(
                                            (sum, result) => sum + (result?.totalMarks || 0),
                                            0
                                        );
                                        const percentage =
                                            totalPossible > 0
                                                ? (totalMarks / totalPossible) * 100
                                                : 0;

                                        return (
                                            <tr
                                                key={index}
                                                className={index % 2 === 0 ? "bg-gray-100" : ""}
                                            >
                                                <td className="border border-gray-300 p-1 sm:p-2">
                                                    {subject?.subjectName}
                                                </td>
                                                {term1Exams.map((examId) => {
                                                    const examResult = subject?.examResults?.find(
                                                        (result) => result.examId === examId
                                                    );
                                                    return (
                                                        <td
                                                            key={examId}
                                                            className="border border-gray-300 p-1 sm:p-2 text-center"
                                                        >
                                                            {examResult ? `${examResult?.marks} ` : "-/-"}

                                                        </td>
                                                    );
                                                })}
                                                {term1Exams.length > 0 ? (
                                                    <td className="border border-gray-300 p-1 sm:p-2 text-center">
                                                        {term1TotalMarks} / {term1TotalPossibleMarks}
                                                    </td>
                                                ) : null}
                                                {showTerm2 && term2Exams.map((examId) => {
                                                    const examResult = subject?.examResults?.find(
                                                        (result) => result.examId === examId
                                                    );
                                                    return (
                                                        <td
                                                            key={examId}
                                                            className="border border-gray-300 p-1 sm:p-2 text-center"
                                                        >
                                                            {examResult ? `${examResult?.marks} ` : "-/-"}
                                                        </td>
                                                    );
                                                })}
                                                {showTerm2 && term2Exams.length > 0 ? (
                                                    <td className="border border-gray-300 p-1 sm:p-2 text-center">
                                                        {term2TotalMarks} / {term2TotalPossibleMarks}
                                                    </td>
                                                ) : null}
                                                <td className="border border-gray-300 p-1 sm:p-2 text-center">
                                                    {totalMarks}
                                                </td>
                                                <td className="border border-gray-300 p-1 sm:p-2 text-center">
                                                    {percentage?.toFixed(2)}%
                                                </td>
                                                <td className="border border-gray-300 p-1 sm:p-2 text-center">
                                                    {calculateGrade(percentage)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="font-semibold bg-gray-200">
                                        <td className="border border-gray-300 p-1 sm:p-2">Obtain Marks</td>
                                        {term1Exams.length > 0 ? <td className="border border-gray-300 p-1 sm:p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
                                        {term1Exams.length > 0 ? <td className="border border-gray-300 p-1 sm:p-2 text-center">{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
                                        {showTerm2 && term2Exams.length > 0 ? <td className="border border-gray-300 p-1 sm:p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td> : null}
                                        {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-1 sm:p-2 text-center">{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td>) : null}
                                        <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallTotalMarks}</td>
                                        <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallPercentage.toFixed(2)}%</td>
                                        <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallGrade}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-1">Activity</th>
                                        <th className="border border-gray-300 p-1">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coScholasticData?.map((activity, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-300 p-1">
                                                {activity?.activityName}
                                            </td>
                                            <td className="border border-gray-300 p-1 text-center">
                                                {activity?.grade}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {Object.keys(overAll).length > 0 && (
                                <div className="mt-2 text-xs sm:text-sm">
                                    <p>
                                        Total Marks : <b>{overAll.totalMarks}/{overAll.totalPossibleMarks}</b>
                                    </p>
                                    <p>
                                        Percentage :<b>{overAll.percentage?.toFixed(2)}%</b>
                                    </p>
                                    <p>
                                        Grade : <b>{overAll.grade}</b>
                                    </p>
                                    <p>
                                        Result: <b>{overAll.isPassed ? "Passed" : "Failed"}</b>
                                    </p>
                                </div>
                            )}
                            <div className="mt-1 sm:mt-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
                                    <p className="text-xs sm:text-sm">Excellent performance. Keep up the good work!</p>
                                </div>
                            </div>
                            <div className="mt-2 sm:mt-8 flex justify-between text-xs sm:text-sm">
                                <div>
                                    <div className="mb-4 sm:mb-8"></div>
                                    <div>Class Teacher's Signature</div>
                                </div>
                                <div>
                                    <div className="mb-4 sm:mb-8"></div>
                                    <div>Principal's Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="mb-4 mx-auto">
                <div
                    className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
                    style={{
                        background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
                    }}
                >
                    <p className="text-lg">Report Card</p>
                    <MdDownload
                        onClick={generatePDF}
                        className="text-2xl cursor-pointer"
                    />
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-col space-y-1 mt-[2px]">

                        <select
                            name="studentClass"
                            className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
                            onFocus={(e) =>
                                (e.target.style.borderColor = currentColor)
                            }
                            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                            value={selectedClass}
                            onChange={handleClassChange}
                            required
                        >
                            <option value="" disabled>
                                Select a Class
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
                            className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
                            onFocus={(e) =>
                                (e.target.style.borderColor = currentColor)
                            }
                            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                            value={selectedSection} // Use selectedSection here
                            onChange={handleSectionChange} //And section handler here
                            required
                        >
                            <option value="" disabled>
                                Select a Section
                            </option>
                            {availableSections?.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4 w-full sm:w-auto">
                        {/* <h3 className="text-lg font-semibold mb-2">Select Student</h3> */}
                        <select
                            className="p-2 border rounded w-full sm:w-auto"
                            onChange={handleStudentChange}
                            value={
                                isAllStudentsSelected ? "all" : selectedStudent?._id || ""
                            }
                        >
                            <option value="">Select a student</option>
                            <option value="all">All Students</option>
                            {allStudents.map((student) => (
                                <option key={student?._id} value={student?._id}>
                                    {student?.fullName} - Class {student?.class} {student?.section}{" "}
                                    (Roll No: {student?.rollNo})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className=" w-full sm:w-auto">
                        {/* <h3 className="text-lg font-semibold mb-2">Select Exams</h3> */}
                        <div className="border-2 p-2 overflow-x-auto">
                            <form className="flex gap-2  items-center justify-center flex-wrap">
                                {examData?.map((exam) => (
                                    <div key={exam._id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={exam?._id}
                                            value={exam?._id}
                                            checked={selectedExams.includes(exam?._id)}
                                            onChange={() => handleCheckboxChange(exam)}
                                            className="mr-2"
                                            />
                                            <label htmlFor={exam._id} className="text-xs sm:text-sm">{exam.name}</label>
                                        </div>
                                    ))}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div ref={componentPDF} className="">
                    {isAllStudentsSelected ? (
                        allStudents.map((student) => renderReportCard(student))
                    ) : (
                        selectedStudent && renderReportCard(selectedStudent)
                    )}
                </div>
                {loading && (
                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </>
        );
    };
    
    export default ReportCard;



// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { AdminAllStudents, AdminGetAllClasses } from "../../Network/AdminApi";

// const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
// };

// const ReportCard = () => {
//      const [getClass, setGetClass] = useState([]);
    
//      const [selectedClass, setSelectedClass] = useState("");
//      const [availableSections, setAvailableSections] = useState([]);
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });
//     console.log("selectedClass",selectedClass)
//     const allStudent=async()=>{
//         try {
            
//             const response=await AdminAllStudents()
//                 if(response?.allStudent){
// const filterStudent=response?.allStudent.filter((val)=>val.class===selectedClass)
// setAllStudents(filterStudent? filterStudent : response?.allStudent);
//                 }
            
//         } catch (error) {
            
//         }
//     }

//     useEffect(() => {
//         allStudent()
//     }, [selectedClass]);
// const getClasses=async()=>{
//     try {
//         const response= await AdminGetAllClasses()
        
//         if (response) {
//             let classes = response?.classList;

//         setGetClass(classes.sort((a, b) => a - b));}
//     } catch (error) {
        
//     }
// }

//     const getResult = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [authToken]);

//     useEffect(() => {
//         getResult();
//         getClasses()
//     }, []);

//     const handleClassChange = (e) => {
//         const selectedClassName = e.target.value;
//         setSelectedClass(selectedClassName);
//         const selectedClassObj = getClass?.find(
//           (cls) => cls.className === selectedClassName
//         );
    
//         if (selectedClassObj) {
//           setAvailableSections(selectedClassObj.sections.split(", "));
//         } else {
//           setAvailableSections([]);
//         }
//       };

//     const fetchExams = useCallback(async () => {
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             console.log("selectedClass",selectedClass) //selectedClass VIII
//             const filterExam = response?.data?.exams?.filter((val) => val?.className.trim().toLowerCase() === selectedClass.trim().toLowerCase());
//             console.log("filterExam",filterExam)
//             setExamData(response.data.exams);
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//         }
//     }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [selectedClass]);

//     // Function to calculate overall result data
//     const calculateOverallData = useCallback((filteredMarks) => {
//         if (!filteredMarks || filteredMarks.length === 0) {
//             return {};
//         }

//         const overall = filteredMarks.reduce((acc, curr) => {
//             if (curr && curr.marks) {
//                 curr.marks.forEach((mark) => {
//                     acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
//                     acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;
//                 });
//             }

//             return acc;
//         }, { totalMarks: 0, totalPossibleMarks: 0 });

//         const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
//         const grade = calculateGrade(percentage);

//         return {
//             totalMarks: overall.totalMarks,
//             totalPossibleMarks: overall.totalPossibleMarks,
//             percentage,
//             grade,
//             isPassed: percentage >= 35,
//         };
//     }, []);

//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if (isAllStudentsSelected) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === selectedStudent?._id
//         );

//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];

//         setCoScholasticMarks(coScholasticData);
//         setOverallData(calculateOverallData(filteredMarks));

//         const updatedExamNames = examData
//             .filter((ex) => selectedExams.includes(ex._id))
//             .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());

//     }, [marks, selectedStudent, selectedExams, isAllStudentsSelected, calculateOverallData, examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//                 (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//             setIsAllStudentsSelected(false);
//         }
//     };

//     const renderReportCard = (student) => {
//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === student?._id
//         );
//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         const examResultsData = { marks: combinedResults };

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];


//         const overAll = calculateOverallData(filteredMarks);

//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const showTerm2 = selectedExams.length >= 4;
//         // Calculate overall totals
//         let overallTotalMarks = 0;
//         let overallTotalPossibleMarks = 0;
//         examResultsData?.marks?.forEach((subject) => {
//             const subjectTotalMarks = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.marks || 0),
//                 0
//             );
//             const subjectTotalPossible = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.totalMarks || 0),
//                 0
//             );
//             overallTotalMarks += subjectTotalMarks;
//             overallTotalPossibleMarks += subjectTotalPossible;
//         });
//         const overallPercentage =
//             overallTotalPossibleMarks > 0
//                 ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//                 : 0;
//         const overallGrade = calculateGrade(overallPercentage);

//         // Calculate overall term totals
//         let term1OverallTotalMarks = 0;
//         let term1OverallTotalPossibleMarks = 0;
//         term1Exams.forEach((examId) => {
//           examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             if(examResult)
//             {
//                 term1OverallTotalMarks += examResult.marks;
//                 term1OverallTotalPossibleMarks += examResult.totalMarks;
//             }
              
//           });
//       });
//       let term2OverallTotalMarks = 0;
//         let term2OverallTotalPossibleMarks = 0;
//       term2Exams.forEach((examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             if(examResult)
//             {
//                 term2OverallTotalMarks += examResult.marks;
//                 term2OverallTotalPossibleMarks += examResult.totalMarks;
//             }
//         });
//       });
//         return (
//             <div className="flex justify-center items-center p-2 sm:p-3"  key={student?._id}>
//                  <div className="w-[190mm] sm:w-[210mm]  mx-auto">
//                     <div className="bg-white border-2 border-black py-1 sm:py-2  px-1 sm:px-3">
//                         <div className="  px-1 py-2 sm:py-8">
//                             <div className="flex items-center justify-between mb-2 sm:mb-6 flex-wrap">
//                                  <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center flex-1">
//                                     <h1 className="text-red-600 font-bold text-xl sm:text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-sm sm:text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-xs sm:text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-xs sm:text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[50px] sm:w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border p-1 sm:p-2 mb-1">
//                                 <div>
//                                     <table className=" text-xs sm:text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                     {student?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-xs sm:text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {student?.class || "N/A"}-
//                                                     {student?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {student?.dateOfBirth
//                                                         ? new Date(student.dateOfBirth).toLocaleDateString(
//                                                             "en-GB",
//                                                             {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             }
//                                                         )
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             student?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                            <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         <th
//                                             colSpan="4"
//                                             className="border border-l border-gray-300 p-1 sm:p-2 text-center"
//                                         >
//                                             TERM-I
//                                         </th>
//                                         {showTerm2 && (
//                                             <th
//                                                 colSpan="4"
//                                                 className="border border-gray-300 p-1 sm:p-2 text-center"
//                                             >
//                                                 TERM-II
//                                             </th>
//                                         )}
//                                         <th
//                                             colSpan={term1Exams.length}
//                                             className="border border-gray-300 p-1 sm:p-2 text-center"
//                                         >
//                                             GRAND TOTAL
//                                         </th>
//                                     </tr>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-1 sm:p-2">SUBJECTS</th>
//                                         {term1Exams.map((examId) => {
//                                             const exam = examData.find((ex) => ex._id === examId);
//                                             return (
//                                                 exam && (
//                                                     <th key={examId} className="border border-gray-300 p-1 sm:p-2">
//                                                         {exam.name}
//                                                     </th>
//                                                 )
//                                             );
//                                         })}
//                                         {term1Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
//                                         ) : null}
//                                         {showTerm2 &&
//                                             term2Exams.map((examId) => {
//                                                 const exam = examData.find((ex) => ex._id === examId);
//                                                 return (
//                                                     exam && (
//                                                         <th key={examId} className="border border-gray-300 p-1 sm:p-2">
//                                                             {exam.name}
//                                                         </th>
//                                                     )
//                                                 );
//                                             })}
//                                         {showTerm2 && term2Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
//                                         ) : null}
//                                         <th className="border border-gray-300 p-1 sm:p-2">TOTAL</th>
//                                         <th className="border border-gray-300 p-1 sm:p-2">%</th>
//                                         <th className="border border-gray-300 p-1 sm:p-2">GRADE</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {examResultsData?.marks?.map((subject, index) => {
//                                          let term1TotalMarks = 0;
//                                         let term1TotalPossibleMarks = 0;
//                                         term1Exams.forEach((examId) => {
//                                             const examResult = subject.examResults.find(res => res.examId === examId);
//                                             if(examResult){
//                                                 term1TotalMarks += examResult.marks;
//                                                 term1TotalPossibleMarks += examResult.totalMarks;
//                                             }
//                                         });
//                                           let term2TotalMarks = 0;
//                                         let term2TotalPossibleMarks = 0;
//                                          term2Exams.forEach((examId) => {
//                                             const examResult = subject.examResults.find(res => res.examId === examId);
//                                             if(examResult){
//                                                  term2TotalMarks += examResult.marks;
//                                                  term2TotalPossibleMarks += examResult.totalMarks;
//                                             }
//                                         });
//                                         const totalMarks = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.marks || 0),
//                                             0
//                                         );
//                                         const totalPossible = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.totalMarks || 0),
//                                             0
//                                         );
//                                         const percentage =
//                                             totalPossible > 0
//                                                 ? (totalMarks / totalPossible) * 100
//                                                 : 0;

//                                         return (
//                                             <tr
//                                                 key={index}
//                                                 className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                             >
//                                                 <td className="border border-gray-300 p-1 sm:p-2">
//                                                     {subject?.subjectName}
//                                                 </td>
//                                                 {term1Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-1 sm:p-2 text-center"
//                                                         >
//                                                             {examResult ? `${examResult?.marks} `: "-/-"}
                                                           
//                                                         </td>
//                                                     );
//                                                 })}
//                                                   {term1Exams.length > 0 ? (
//                                                      <td className="border border-gray-300 p-1 sm:p-2 text-center">
//                                                        {term1TotalMarks} / {term1TotalPossibleMarks}
//                                                      </td>
//                                                    ) : null}
//                                                 {showTerm2 && term2Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-1 sm:p-2 text-center"
//                                                         >
//                                                             {examResult ? `${examResult?.marks} `: "-/-"}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                 {showTerm2 && term2Exams.length > 0 ? (
//                                                     <td className="border border-gray-300 p-1 sm:p-2 text-center">
//                                                       {term2TotalMarks} / {term2TotalPossibleMarks}
//                                                     </td>
//                                                   ) : null}
//                                                 <td className="border border-gray-300 p-1 sm:p-2 text-center">
//                                                     {totalMarks}
//                                                 </td>
//                                                 <td className="border border-gray-300 p-1 sm:p-2 text-center">
//                                                     {percentage?.toFixed(2)}%
//                                                 </td>
//                                                 <td className="border border-gray-300 p-1 sm:p-2 text-center">
//                                                     {calculateGrade(percentage)}
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                      <tr className="font-semibold bg-gray-200">
//                                           <td className="border border-gray-300 p-1 sm:p-2">Obtain Marks</td>
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-1 sm:p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-1 sm:p-2 text-center">{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-1 sm:p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-1 sm:p-2 text-center">{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallTotalMarks}</td>
//                                           <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                           <td className="border border-gray-300 p-1 sm:p-2 text-center">{overallGrade}</td>
//                                       </tr>
//                                 </tbody>
//                             </table>
//                             <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-1">Activity</th>
//                                         <th className="border border-gray-300 p-1">Grade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {coScholasticData?.map((activity, index) => (
//                                         <tr key={index}>
//                                             <td className="border border-gray-300 p-1">
//                                                 {activity?.activityName}
//                                             </td>
//                                             <td className="border border-gray-300 p-1 text-center">
//                                                 {activity?.grade}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             {Object.keys(overAll).length > 0 && (
//                                 <div className="mt-2 text-xs sm:text-sm">
//                                     <p>
//                                         Total Marks : <b>{overAll.totalMarks}/{overAll.totalPossibleMarks}</b>
//                                     </p>
//                                     <p>
//                                         Percentage :<b>{overAll.percentage?.toFixed(2)}%</b>
//                                     </p>
//                                     <p>
//                                         Grade : <b>{overAll.grade}</b>
//                                     </p>
//                                     <p>
//                                         Result: <b>{overAll.isPassed ? "Passed" : "Failed"}</b>
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="mt-1 sm:mt-4">
//                                 <div>
//                                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                     <p className="text-xs sm:text-sm">Excellent performance. Keep up the good work!</p>
//                                 </div>
//                             </div>
//                              <div className="mt-2 sm:mt-8 flex justify-between text-xs sm:text-sm">
//                                 <div>
//                                     <div className="mb-4 sm:mb-8"></div>
//                                     <div>Class Teacher's Signature</div>
//                                 </div>
//                                 <div>
//                                     <div className="mb-4 sm:mb-8"></div>
//                                     <div>Principal's Signature</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex flex-col sm:flex-row gap-2">
//                 <div className="flex flex-col space-y-1 mt-[2px]">
                     
//                      <select
//                        name="studentClass"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={selectedClass}
//                        onChange={handleClassChange}
//                        required
//                      >
//                        <option value="" disabled>
//                          Select a Class
//                        </option>
//                        {getClass?.map((cls, index) => (
//                          <option key={index} value={cls.className}>
//                            {cls?.className}
//                          </option>
//                        ))}
//                      </select>
//                    </div>
//                    <div className="flex flex-col space-y-1 mt-[2px]">
                    
//                      <select
//                        name="studentSection"
//                        className=" w-full border-1 border-black outline-none py-[3px] bg-inherit"
//                        onFocus={(e) =>
//                          (e.target.style.borderColor = currentColor)
//                        }
//                        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//                        value={selectedClass}
//                        onChange={handleClassChange}
//                        required
//                      >
//                        <option value="" disabled>
//                       Select a Section
//                        </option>
//                        {availableSections?.map((item, index) => (
//                         <option key={index} value={item}>
//                         {item}
//                       </option>
//                        ))}
//                      </select>
//                    </div>
//                     <div className="mb-4 w-full sm:w-auto">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                          <select
//                             className="p-2 border rounded w-full sm:w-auto"
//                             onChange={handleStudentChange}
//                             value={
//                                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//                             }
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                      <div className=" w-full sm:w-auto">
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <div className="border-2 p-2 overflow-x-auto">
//                         <form className="flex gap-2  items-center justify-center flex-wrap">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id} className="text-xs sm:text-sm">{exam.name}</label>
//                                 </div>
//                             ))}
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className="">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;




// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
// };

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     const getResult = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [authToken]);

//     useEffect(() => {
//         getResult();
//     }, [getResult]);

//     const fetchExams = useCallback(async () => {
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setExamData(response.data.exams);
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//         }
//     }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [fetchExams]);

//     // Function to calculate overall result data
//     const calculateOverallData = useCallback((filteredMarks) => {
//         if (!filteredMarks || filteredMarks.length === 0) {
//             return {};
//         }

//         const overall = filteredMarks.reduce((acc, curr) => {
//             if (curr && curr.marks) {
//                 curr.marks.forEach((mark) => {
//                     acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
//                     acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;
//                 });
//             }

//             return acc;
//         }, { totalMarks: 0, totalPossibleMarks: 0 });

//         const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
//         const grade = calculateGrade(percentage);

//         return {
//             totalMarks: overall.totalMarks,
//             totalPossibleMarks: overall.totalPossibleMarks, // Add totalPossibleMarks here
//             percentage,
//             grade,
//             isPassed: percentage >= 35, // Assuming a passing percentage of 35%
//         };
//     }, []);

//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if (isAllStudentsSelected) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === selectedStudent?._id
//         );

//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];

//         setCoScholasticMarks(coScholasticData);
//         setOverallData(calculateOverallData(filteredMarks));

//         const updatedExamNames = examData
//             .filter((ex) => selectedExams.includes(ex._id))
//             .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());

//     }, [marks, selectedStudent, selectedExams, isAllStudentsSelected, calculateOverallData, examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//                 (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//             setIsAllStudentsSelected(false);
//         }
//     };

//     const renderReportCard = (student) => {
//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === student?._id
//         );
//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         const examResultsData = { marks: combinedResults };

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];


//         const overAll = calculateOverallData(filteredMarks);

//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const showTerm2 = selectedExams.length >= 4;
//         // Calculate overall totals
//         let overallTotalMarks = 0;
//         let overallTotalPossibleMarks = 0;
//         examResultsData?.marks?.forEach((subject) => {
//             const subjectTotalMarks = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.marks || 0),
//                 0
//             );
//             const subjectTotalPossible = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.totalMarks || 0),
//                 0
//             );
//             overallTotalMarks += subjectTotalMarks;
//             overallTotalPossibleMarks += subjectTotalPossible;
//         });
//         const overallPercentage =
//             overallTotalPossibleMarks > 0
//                 ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//                 : 0;
//         const overallGrade = calculateGrade(overallPercentage);

//         // Calculate overall term totals
//         let term1OverallTotalMarks = 0;
//         let term1OverallTotalPossibleMarks = 0;
//         term1Exams.forEach((examId) => {
//           examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             if(examResult)
//             {
//                 term1OverallTotalMarks += examResult.marks;
//                 term1OverallTotalPossibleMarks += examResult.totalMarks;
//             }
              
//           });
//       });
//       let term2OverallTotalMarks = 0;
//         let term2OverallTotalPossibleMarks = 0;
//       term2Exams.forEach((examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             if(examResult)
//             {
//                 term2OverallTotalMarks += examResult.marks;
//                 term2OverallTotalPossibleMarks += examResult.totalMarks;
//             }
//         });
//       });
//         return (
//             <div className="flex justify-center items-center p-3">
//                 <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
//                     <div className=" bg-white border-2 border-black  py-2  px-3">
//                         {/* <div className=" bg-white border  py-8 bg-red-300 px-3"> */}
//                         <div className=" px-1 py-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="h-[70px] w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center">
//                                     <h1 className="text-red-600 font-bold text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                 <div>
//                                     <table className=" text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                     {student?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {student?.class || "N/A"}-
//                                                     {student?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {student?.dateOfBirth
//                                                         ? new Date(student.dateOfBirth).toLocaleDateString(
//                                                             "en-GB",
//                                                             {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             }
//                                                         )
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             student?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-24 h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         <th
//                                             colSpan="4"
//                                             className="border border-l border-gray-300 p-2 text-center"
//                                         >
//                                             TERM-I
//                                         </th>
//                                         {showTerm2 && (
//                                             <th
//                                                 colSpan="4"
//                                                 className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 TERM-II
//                                             </th>
//                                         )}
//                                         <th
//                                             colSpan={term1Exams.length}
//                                             className="border border-gray-300 p-2 text-center"
//                                         >
//                                             GRAND TOTAL
//                                         </th>
//                                     </tr>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                         {term1Exams.map((examId) => {
//                                             const exam = examData.find((ex) => ex._id === examId);
//                                             return (
//                                                 exam && (
//                                                     <th key={examId} className="border border-gray-300 p-2">
//                                                         {exam.name}
//                                                     </th>
//                                                 )
//                                             );
//                                         })}
//                                         {term1Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                         ) : null}
//                                         {showTerm2 &&
//                                             term2Exams.map((examId) => {
//                                                 const exam = examData.find((ex) => ex._id === examId);
//                                                 return (
//                                                     exam && (
//                                                         <th key={examId} className="border border-gray-300 p-2">
//                                                             {exam.name}
//                                                         </th>
//                                                     )
//                                                 );
//                                             })}
//                                         {showTerm2 && term2Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                         ) : null}
//                                         <th className="border border-gray-300 p-2">TOTAL</th>
//                                         <th className="border border-gray-300 p-2">%</th>
//                                         <th className="border border-gray-300 p-2">GRADE</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {examResultsData?.marks?.map((subject, index) => {
//                                          let term1TotalMarks = 0;
//                                         let term1TotalPossibleMarks = 0;
//                                         term1Exams.forEach((examId) => {
//                                             const examResult = subject.examResults.find(res => res.examId === examId);
//                                             if(examResult){
//                                                 term1TotalMarks += examResult.marks;
//                                                 term1TotalPossibleMarks += examResult.totalMarks;
//                                             }
//                                         });
//                                           let term2TotalMarks = 0;
//                                         let term2TotalPossibleMarks = 0;
//                                          term2Exams.forEach((examId) => {
//                                             const examResult = subject.examResults.find(res => res.examId === examId);
//                                             if(examResult){
//                                                  term2TotalMarks += examResult.marks;
//                                                  term2TotalPossibleMarks += examResult.totalMarks;
//                                             }
//                                         });
//                                         const totalMarks = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.marks || 0),
//                                             0
//                                         );
//                                         const totalPossible = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.totalMarks || 0),
//                                             0
//                                         );
//                                         const percentage =
//                                             totalPossible > 0
//                                                 ? (totalMarks / totalPossible) * 100
//                                                 : 0;

//                                         return (
//                                             <tr
//                                                 key={index}
//                                                 className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                             >
//                                                 <td className="border border-gray-300 p-2">
//                                                     {subject?.subjectName}
//                                                 </td>
//                                                 {term1Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-2 text-center"
//                                                         >
//                                                             {examResult ? `${examResult?.marks} `: "-/-"}
//                                                             {/* {examResult ? `${examResult?.marks} / ${examResult?.totalMarks}`: "-/-"} */}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                  {term1Exams.length > 0 ? (
//                                                      <td className="border border-gray-300 p-2 text-center">
//                                                        {term1TotalMarks} / {term1TotalPossibleMarks}
//                                                      </td>
//                                                    ) : null}
//                                                 {showTerm2 && term2Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-2 text-center"
//                                                         >
//                                                           {examResult ? `${examResult?.marks} `: "-/-"}
//                                                           {/* {examResult ? `${examResult?.marks} / ${examResult?.totalMarks}`: "-/-"} */}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                 {showTerm2 && term2Exams.length > 0 ? (
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                       {term2TotalMarks} / {term2TotalPossibleMarks}
//                                                     </td>
//                                                   ) : null}
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {totalMarks}
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {percentage?.toFixed(2)}%
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {calculateGrade(percentage)}
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                       <tr className="font-semibold bg-gray-200">
//                                           <td className="border border-gray-300 p-2">Obtain Marks</td>
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                                       </tr>
//                                 </tbody>
//                             </table>
//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-1">Activity</th>
//                                         <th className="border border-gray-300 p-1">Grade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {coScholasticData?.map((activity, index) => (
//                                         <tr key={index}>
//                                             <td className="border border-gray-300 p-1">
//                                                 {activity?.activityName}
//                                             </td>
//                                             <td className="border border-gray-300 p-1 text-center">
//                                                 {activity?.grade}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             {Object.keys(overAll).length > 0 && (
//                                 <div className="mt-2">
//                                     <p>
//                                         Total Marks : <b>{overAll.totalMarks}/{overAll.totalPossibleMarks}</b>
//                                     </p>
//                                     <p>
//                                         Percentage :<b>{overAll.percentage?.toFixed(2)}%</b> 
//                                     </p>
//                                     <p>
//                                         Grade : <b>{overAll.grade}</b>
//                                     </p>
//                                     <p>
//                                         Result: <b>{overAll.isPassed ? "Passed" : "Failed"}</b>
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="">
//                                 <div>
//                                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                     <p>Excellent performance. Keep up the good work!</p>
//                                 </div>
//                             </div>
//                             <div className="mt-8 flex justify-between text-sm">
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Class Teacher's Signature</div>
//                                 </div>
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Principal's Signature</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={
//                                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//                             }
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className="">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;



// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
// };

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     const getResult = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [authToken]);

//     useEffect(() => {
//         getResult();
//     }, [getResult]);

//     const fetchExams = useCallback(async () => {
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setExamData(response.data.exams);
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//         }
//     }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [fetchExams]);

//     // Function to calculate overall result data
//     const calculateOverallData = useCallback((filteredMarks) => {
//         if (!filteredMarks || filteredMarks.length === 0) {
//             return {};
//         }

//         const overall = filteredMarks.reduce((acc, curr) => {
//             if (curr && curr.marks) {
//                 curr.marks.forEach((mark) => {
//                     acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
//                     acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;
//                 });
//             }

//             return acc;
//         }, { totalMarks: 0, totalPossibleMarks: 0 });

//         const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
//         const grade = calculateGrade(percentage);

//         return {
//             totalMarks: overall.totalMarks,
//             totalPossibleMarks: overall.totalPossibleMarks, // Add totalPossibleMarks here
//             percentage,
//             grade,
//             isPassed: percentage >= 35, // Assuming a passing percentage of 35%
//         };
//     }, []);

//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if (isAllStudentsSelected) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === selectedStudent?._id
//         );

//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];

//         setCoScholasticMarks(coScholasticData);
//         setOverallData(calculateOverallData(filteredMarks));

//         const updatedExamNames = examData
//             .filter((ex) => selectedExams.includes(ex._id))
//             .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());

//     }, [marks, selectedStudent, selectedExams, isAllStudentsSelected, calculateOverallData, examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//                 (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//             setIsAllStudentsSelected(false);
//         }
//     };

//     const renderReportCard = (student) => {
//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === student?._id
//         );
//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         const examResultsData = { marks: combinedResults };

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//         );

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];


//         const overAll = calculateOverallData(filteredMarks);

//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const showTerm2 = selectedExams.length >= 4;
//         // Calculate overall totals
//         let overallTotalMarks = 0;
//         let overallTotalPossibleMarks = 0;
//         examResultsData?.marks?.forEach((subject) => {
//             const subjectTotalMarks = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.marks || 0),
//                 0
//             );
//             const subjectTotalPossible = subject?.examResults?.reduce(
//                 (sum, result) => sum + (result?.totalMarks || 0),
//                 0
//             );
//             overallTotalMarks += subjectTotalMarks;
//             overallTotalPossibleMarks += subjectTotalPossible;
//         });
//         const overallPercentage =
//             overallTotalPossibleMarks > 0
//                 ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//                 : 0;
//         const overallGrade = calculateGrade(overallPercentage);

//         // Calculate overall term totals
//         const term1OverallTotalMarks = term1Exams.reduce((sum, examId) => {
//             examResultsData?.marks?.forEach(subject => {
//                 const examResult = subject.examResults.find(res => res.examId === examId);
//                 sum += examResult ? examResult.marks : 0
//             })
//             return sum;
//         }, 0);
//         const term1OverallTotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//             examResultsData?.marks?.forEach(subject => {
//                 const examResult = subject.examResults.find(res => res.examId === examId);
//                 sum += examResult ? examResult.totalMarks : 0
//             })
//             return sum
//         }, 0);
//         const term2OverallTotalMarks = term2Exams.reduce((sum, examId) => {
//             examResultsData?.marks?.forEach(subject => {
//                 const examResult = subject.examResults.find(res => res.examId === examId);
//                 sum += examResult ? examResult.marks : 0
//             })
//             return sum
//         }, 0);
//         const term2OverallTotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//             examResultsData?.marks?.forEach(subject => {
//                 const examResult = subject.examResults.find(res => res.examId === examId);
//                 sum += examResult ? examResult.totalMarks : 0
//             })
//             return sum;
//         }, 0);

//         return (
//             <div className="flex justify-center items-center p-3">
//                 <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
//                     <div className=" bg-white border  py-2  px-3">
//                         {/* <div className=" bg-white border  py-8 bg-red-300 px-3"> */}
//                         <div className=" px-1 py-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="h-[70px] w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center">
//                                     <h1 className="text-red-600 font-bold text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                 <div>
//                                     <table className=" text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                     {student?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {student?.class || "N/A"}-
//                                                     {student?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {student?.dateOfBirth
//                                                         ? new Date(student.dateOfBirth).toLocaleDateString(
//                                                             "en-GB",
//                                                             {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             }
//                                                         )
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             student?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-24 h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         <th
//                                             colSpan="4"
//                                             className="border border-l border-gray-300 p-2 text-center"
//                                         >
//                                             TERM-I
//                                         </th>
//                                         {showTerm2 && (
//                                             <th
//                                                 colSpan="4"
//                                                 className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 TERM-II
//                                             </th>
//                                         )}
//                                         <th
//                                             // colSpan="3"
//                                             colSpan={term1Exams.length}
//                                             className="border border-gray-300 p-2 text-center"
//                                         >
//                                             GRAND TOTAL
//                                         </th>
//                                     </tr>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                         {term1Exams.map((examId) => {
//                                             const exam = examData.find((ex) => ex._id === examId);
//                                             return (
//                                                 exam && (
//                                                     <th key={examId} className="border border-gray-300 p-2">
//                                                         {exam.name}
//                                                     </th>
//                                                 )
//                                             );
//                                         })}
//                                         {term1Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                         ) : null}
//                                         {showTerm2 &&
//                                             term2Exams.map((examId) => {
//                                                 const exam = examData.find((ex) => ex._id === examId);
//                                                 return (
//                                                     exam && (
//                                                         <th key={examId} className="border border-gray-300 p-2">
//                                                             {exam.name}
//                                                         </th>
//                                                     )
//                                                 );
//                                             })}
//                                         {showTerm2 && term2Exams.length > 0 ? (
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                         ) : null}
//                                         <th className="border border-gray-300 p-2">TOTAL</th>
//                                         <th className="border border-gray-300 p-2">%</th>
//                                         <th className="border border-gray-300 p-2">GRADE</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {examResultsData?.marks?.map((subject, index) => {
//                                         const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                         const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.totalMarks : 0);
//                                         }, 0);
//                                         const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                         const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.totalMarks : 0);
//                                         }, 0);

//                                         const totalMarks = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.marks || 0),
//                                             0
//                                         );
//                                         const totalPossible = subject?.examResults?.reduce(
//                                             (sum, result) => sum + (result?.totalMarks || 0),
//                                             0
//                                         );
//                                         const percentage =
//                                             totalPossible > 0
//                                                 ? (totalMarks / totalPossible) * 100
//                                                 : 0;

//                                         return (
//                                             <tr
//                                                 key={index}
//                                                 className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                             >
//                                                 <td className="border border-gray-300 p-2">
//                                                     {subject?.subjectName}
//                                                 </td>
//                                                 {term1Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-2 text-center"
//                                                         >
//                                                             {examResult ? examResult?.marks : "-/-"}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                 {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                                                 {showTerm2 && term2Exams.map((examId) => {
//                                                     const examResult = subject?.examResults?.find(
//                                                         (result) => result.examId === examId
//                                                     );
//                                                     return (
//                                                         <td
//                                                             key={examId}
//                                                             className="border border-gray-300 p-2 text-center"
//                                                         >
//                                                             {examResult ? examResult?.marks : "-/-"}
//                                                         </td>
//                                                     );
//                                                 })}
//                                                 {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {totalMarks}
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {percentage?.toFixed(2)}%
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {calculateGrade(percentage)}
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                     <tr className="font-semibold bg-gray-200">
//                                         <td className="border border-gray-300 p-2">Overall Total</td>
//                                         {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}</td> : null}
//                                         {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}</td> : null}
//                                         {showTerm2 && term2Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}</td> : null}
//                                         {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}</td>) : null}
//                                         <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                         <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                         <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-1">Activity</th>
//                                         <th className="border border-gray-300 p-1">Grade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {coScholasticData?.map((activity, index) => (
//                                         <tr key={index}>
//                                             <td className="border border-gray-300 p-1">
//                                                 {activity?.activityName}
//                                             </td>
//                                             <td className="border border-gray-300 p-1 text-center">
//                                                 {activity?.grade}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             {Object.keys(overAll).length > 0 && (
//                                 <div className="mt-2">
//                                     <p>
//                                         <b>Total Marks:</b> {overAll.totalMarks}/{overAll.totalPossibleMarks}
//                                     </p>
//                                     <p>
//                                         <b>Percentage:</b> {overAll.percentage?.toFixed(2)}%
//                                     </p>
//                                     <p>
//                                         <b>Grade:</b> {overAll.grade}
//                                     </p>
//                                     <p>
//                                         <b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="">
//                                 <div>
//                                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                     <p>Excellent performance. Keep up the good work!</p>
//                                 </div>
//                             </div>
//                             <div className="mt-8 flex justify-between text-sm">
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Class Teacher's Signature</div>
//                                 </div>
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Principal's Signature</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={
//                                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//                             }
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className="">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;



// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
// };


// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     const getResult = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [authToken]);

//     useEffect(() => {
//         getResult();
//     }, [getResult]);

//     const fetchExams = useCallback(async () => {
//       try {
//           const response = await axios.get(
//               "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//               {
//                 withCredentials: true,
//                 headers: { Authorization: `Bearer ${authToken}` },
//               }
//           );
//           setExamData(response.data.exams);
//       } catch (error) {
//           console.error("Error fetching exams:", error);
//       }
//   }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [fetchExams]);

//   // Function to calculate overall result data
//   const calculateOverallData = useCallback((filteredMarks) => {
//     if (!filteredMarks || filteredMarks.length === 0) {
//       return { };
//     }

//     const overall = filteredMarks.reduce((acc, curr) => {
//        if(curr && curr.marks){
//         curr.marks.forEach(mark =>{
//             acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
//             acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;

//         })
//         }

//         return acc;
//     }, {totalMarks:0,totalPossibleMarks:0});

//     const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
//     const grade = calculateGrade(percentage); 
  
//     return {
//         totalMarks: overall.totalMarks,
//         percentage,
//         grade,
//         isPassed: percentage >= 35 // Assuming a passing percentage of 35%
//     };
//   },[]);
//     useEffect(() => {
//       if (!selectedStudent || marks.length === 0) {
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         setOverallData({});
//         return;
//     }

//     if (isAllStudentsSelected) {
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         setOverallData({});
//         return;
//     }
  
//       const studentMarks = marks.filter(
//         (mark) => mark?.studentId?._id === selectedStudent?._id
//       );
  
//       const filteredMarks = studentMarks.filter((mark) =>
//         selectedExams.includes(mark.examId)
//       );

//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//             acc?.push({
//               ...mark,
//               examResults: [
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ],
//             });
//           } else {
//             existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ];
//           }
//         });
//         return acc;
//       }, []);
  
//       setExamResults({ marks: combinedResults });
    
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//           );
         
//       const coScholasticData = lastSelectedExamMarks
//         ? lastSelectedExamMarks.coScholasticMarks
//         : [];

//         setCoScholasticMarks(coScholasticData);
//         setOverallData(calculateOverallData(filteredMarks));
      
//         const updatedExamNames = examData
//         .filter((ex) => selectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());

//   }, [marks, selectedStudent, selectedExams, isAllStudentsSelected,calculateOverallData,examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//                 (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//             setIsAllStudentsSelected(false);
//         }
//     };

//     const renderReportCard = (student) => {
//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === student?._id
//         );
//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );
  
//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//           curr.marks.forEach((mark) => {
//             const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//             if (!existingMark) {
//               acc?.push({
//                 ...mark,
//                 examResults: [
//                   {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                   },
//                 ],
//               });
//             } else {
//               existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ];
//             }
//           });
//           return acc;
//         }, []);
  
//         const examResultsData = { marks: combinedResults };
  
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//           (mark) => mark.examId === lastSelectedExamId
//         );
      
//         const coScholasticData = lastSelectedExamMarks
//           ? lastSelectedExamMarks.coScholasticMarks
//           : [];
    
    
//       const overAll = calculateOverallData(filteredMarks);
  
//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const showTerm2 = selectedExams.length >= 4;
//           // Calculate overall totals
//           let overallTotalMarks = 0;
//           let overallTotalPossibleMarks = 0;
//           examResultsData?.marks?.forEach((subject) => {
//             const subjectTotalMarks = subject?.examResults?.reduce(
//               (sum, result) => sum + (result?.marks || 0),
//               0
//             );
//             const subjectTotalPossible = subject?.examResults?.reduce(
//               (sum, result) => sum + (result?.totalMarks || 0),
//               0
//             );
//             overallTotalMarks += subjectTotalMarks;
//             overallTotalPossibleMarks += subjectTotalPossible;
//           });
//           const overallPercentage =
//             overallTotalPossibleMarks > 0
//               ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//               : 0;
//           const overallGrade = calculateGrade(overallPercentage);
  
//           // Calculate overall term totals
//           const term1OverallTotalMarks = term1Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.marks : 0
//               })
//               return sum;
//           }, 0);
//           const term1OverallTotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.totalMarks : 0
//               })
//               return sum
//           }, 0);
//           const term2OverallTotalMarks = term2Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.marks : 0
//               })
//               return sum
//           }, 0);
//           const term2OverallTotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.totalMarks : 0
//               })
//               return sum;
//           }, 0);

//         return (
//             <div className="flex justify-center items-center p-3">
//                 <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
//                     <div className=" bg-white border  py-2  px-3">
//                     {/* <div className=" bg-white border  py-8 bg-red-300 px-3"> */}
//                         <div className=" px-1 py-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="h-[70px] w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center">
//                                     <h1 className="text-red-600 font-bold text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                 <div>
//                                     <table className=" text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                     {student?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {student?.class || "N/A"}-
//                                                     {student?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {student?.dateOfBirth
//                                                         ? new Date(student.dateOfBirth).toLocaleDateString(
//                                                             "en-GB",
//                                                             {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             }
//                                                         )
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             student?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-24 h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         <th
//                                             colSpan="4"
//                                             className="border border-l border-gray-300 p-2 text-center"
//                                         >
//                                             TERM-I
//                                         </th>
//                                         {showTerm2 && (
//                                             <th
//                                                 colSpan="4"
//                                                 className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 TERM-II
//                                             </th>
//                                         )}
//                                         <th
//                                             // colSpan="3"
//                                             colSpan={term1Exams.length}
//                                             className="border border-gray-300 p-2 text-center"
//                                         >
//                                             GRAND TOTAL
//                                         </th>
//                                     </tr>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                         {term1Exams.map((examId) => {
//                                             const exam = examData.find((ex) => ex._id === examId);
//                                             return (
//                                                 exam && (
//                                                     <th key={examId} className="border border-gray-300 p-2">
//                                                         {exam.name}
//                                                     </th>
//                                                 )
//                                             );
//                                         })}
//                                          {term1Exams.length > 0 ? (
//                                                 <th className="border border-gray-300 p-2">TOTAL</th>
//                                               ) : null}
//                                         {showTerm2 &&
//                                             term2Exams.map((examId) => {
//                                                 const exam = examData.find((ex) => ex._id === examId);
//                                                 return (
//                                                     exam && (
//                                                         <th key={examId} className="border border-gray-300 p-2">
//                                                             {exam.name}
//                                                         </th>
//                                                     )
//                                                 );
//                                             })}
//                                          {showTerm2 && term2Exams.length > 0 ? (
//                                               <th className="border border-gray-300 p-2">TOTAL</th>
//                                             ) : null}
//                                         <th className="border border-gray-300 p-2">TOTAL</th>
//                                         <th className="border border-gray-300 p-2">%</th>
//                                         <th className="border border-gray-300 p-2">GRADE</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {examResultsData?.marks?.map((subject, index) => {
//                                           const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                           const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                                               const examResult = subject.examResults.find((res) => res.examId === examId);
//                                               return sum + (examResult ? examResult.totalMarks : 0);
//                                           }, 0);
//                                           const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                           const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                                                 const examResult = subject.examResults.find((res) => res.examId === examId);
//                                                 return sum + (examResult ? examResult.totalMarks : 0);
//                                             }, 0);
                                          
//                                       const totalMarks = subject?.examResults?.reduce(
//                                         (sum, result) => sum + (result?.marks || 0),
//                                         0
//                                       );
//                                       const totalPossible = subject?.examResults?.reduce(
//                                         (sum, result) => sum + (result?.totalMarks || 0),
//                                         0
//                                       );
//                                       const percentage =
//                                         totalPossible > 0
//                                           ? (totalMarks / totalPossible) * 100
//                                           : 0;
  
//                                       return (
//                                         <tr
//                                           key={index}
//                                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                         >
//                                           <td className="border border-gray-300 p-2">
//                                             {subject?.subjectName}
//                                           </td>
//                                           {term1Exams.map((examId) => {
//                                             const examResult = subject?.examResults?.find(
//                                               (result) => result.examId === examId
//                                             );
//                                             return (
//                                               <td
//                                                 key={examId}
//                                                 className="border border-gray-300 p-2 text-center"
//                                               >
//                                                 {examResult ? examResult?.marks : "-/-"}
//                                               </td>
//                                             );
//                                           })}
//                                            {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                                             {showTerm2 && term2Exams.map((examId) => {
//                                                 const examResult = subject?.examResults?.find(
//                                                     (result) => result.examId === examId
//                                                 );
//                                                 return (
//                                                     <td
//                                                     key={examId}
//                                                     className="border border-gray-300 p-2 text-center"
//                                                     >
//                                                     {examResult ? examResult?.marks : "-/-"}
//                                                     </td>
//                                                 );
//                                                 })}
//                                                {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {totalMarks}
//                                           </td>
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {percentage?.toFixed(2)}%
//                                           </td>
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {calculateGrade(percentage)}
//                                           </td>
//                                         </tr>
//                                       );
//                                     })}
//                                       <tr className="font-semibold bg-gray-200">
//                                           <td className="border border-gray-300 p-2">Overall Total</td>
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}</td> : null}
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                                       </tr>
//                                 </tbody>
//                             </table>
//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-1">Activity</th>
//                                         <th className="border border-gray-300 p-1">Grade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {coScholasticData?.map((activity, index) => (
//                                         <tr key={index}>
//                                             <td className="border border-gray-300 p-1">
//                                                 {activity?.activityName}
//                                             </td>
//                                             <td className="border border-gray-300 p-1 text-center">
//                                                 {activity?.grade}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             {Object.keys(overAll).length > 0 && (
//                                 <div className="mt-2">
//                                     <p>
//                                         <b>Total Marks:</b> {overAll.totalMarks}
//                                     </p>
//                                     <p>
//                                         <b>Percentage:</b> {overAll.percentage?.toFixed(2)}%
//                                     </p>
//                                     <p>
//                                         <b>Grade:</b> {overAll.grade}
//                                     </p>
//                                      <p>
//                                         <b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="">
//                                 <div>
//                                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                     <p>Excellent performance. Keep up the good work!</p>
//                                 </div>
//                             </div>
//                             <div className="mt-8 flex justify-between text-sm">
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Class Teacher's Signature</div>
//                                 </div>
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Principal's Signature</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={
//                                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//                             }
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className="">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const calculateGrade = (percentage) => {
//   if (percentage >= 90) return "A+";
//   if (percentage >= 80) return "A";
//   if (percentage >= 70) return "B+";
//   if (percentage >= 60) return "B";
//   if (percentage >= 50) return "C";
//   return "F";
// };


// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     const getResult = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     }, [authToken]);

//     useEffect(() => {
//         getResult();
//     }, [getResult]);

//     const fetchExams = useCallback(async () => {
//       try {
//           const response = await axios.get(
//               "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//               {
//                 withCredentials: true,
//                 headers: { Authorization: `Bearer ${authToken}` },
//               }
//           );
//           setExamData(response.data.exams);
//       } catch (error) {
//           console.error("Error fetching exams:", error);
//       }
//   }, [authToken]);
//     useEffect(() => {
//         fetchExams();
//     }, [fetchExams]);

//   // Function to calculate overall result data
//   const calculateOverallData = useCallback((filteredMarks) => {
//     if (!filteredMarks || filteredMarks.length === 0) {
//       return { };
//     }

//     const overall = filteredMarks.reduce((acc, curr) => {
//        if(curr && curr.marks){
//         curr.marks.forEach(mark =>{
//             acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
//             acc.totalPossibleMarks = (acc.totalPossibleMarks || 0) + mark.totalMarks;

//         })
//         }

//         return acc;
//     }, {totalMarks:0,totalPossibleMarks:0});

//     const percentage = overall.totalPossibleMarks > 0 ? (overall.totalMarks / overall.totalPossibleMarks) * 100 : 0;
//     const grade = calculateGrade(percentage); 
  
//     return {
//         totalMarks: overall.totalMarks,
//         percentage,
//         grade,
//         isPassed: percentage >= 35 // Assuming a passing percentage of 35%
//     };
//   },[]);
//     useEffect(() => {
//       if (!selectedStudent || marks.length === 0) {
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         setOverallData({});
//         return;
//     }

//     if (isAllStudentsSelected) {
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         setOverallData({});
//         return;
//     }
  
//       const studentMarks = marks.filter(
//         (mark) => mark?.studentId?._id === selectedStudent?._id
//       );
  
//       const filteredMarks = studentMarks.filter((mark) =>
//         selectedExams.includes(mark.examId)
//       );

//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//             acc?.push({
//               ...mark,
//               examResults: [
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ],
//             });
//           } else {
//             existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ];
//           }
//         });
//         return acc;
//       }, []);
  
//       setExamResults({ marks: combinedResults });
    
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//             (mark) => mark.examId === lastSelectedExamId
//           );
//           console.log("lastSelectedExamMarks",lastSelectedExamMarks)
//       const coScholasticData = lastSelectedExamMarks
//         ? lastSelectedExamMarks.coScholasticMarks
//         : [];

//         setCoScholasticMarks(coScholasticData);
//         setOverallData(calculateOverallData(filteredMarks));
      
//         const updatedExamNames = examData
//         .filter((ex) => selectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());

//   }, [marks, selectedStudent, selectedExams, isAllStudentsSelected,calculateOverallData,examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//                 (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//             setIsAllStudentsSelected(false);
//         }
//     };

//     const renderReportCard = (student) => {
//         const studentMarks = marks.filter(
//             (mark) => mark?.studentId?._id === student?._id
//         );
//         const filteredMarks = studentMarks.filter((mark) =>
//             selectedExams.includes(mark.examId)
//         );
  
//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//           curr.marks.forEach((mark) => {
//             const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//             if (!existingMark) {
//               acc?.push({
//                 ...mark,
//                 examResults: [
//                   {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                   },
//                 ],
//               });
//             } else {
//               existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ];
//             }
//           });
//           return acc;
//         }, []);
  
//         const examResultsData = { marks: combinedResults };
  
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(
//           (mark) => mark.examId === lastSelectedExamId
//         );
    
//         const coScholasticData = lastSelectedExamMarks
//           ? lastSelectedExamMarks.coScholasticMarks
//           : [];
  
//       const overAll = calculateOverallData(filteredMarks);
  
//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const showTerm2 = selectedExams.length >= 4;
//           // Calculate overall totals
//           let overallTotalMarks = 0;
//           let overallTotalPossibleMarks = 0;
//           examResultsData?.marks?.forEach((subject) => {
//             const subjectTotalMarks = subject?.examResults?.reduce(
//               (sum, result) => sum + (result?.marks || 0),
//               0
//             );
//             const subjectTotalPossible = subject?.examResults?.reduce(
//               (sum, result) => sum + (result?.totalMarks || 0),
//               0
//             );
//             overallTotalMarks += subjectTotalMarks;
//             overallTotalPossibleMarks += subjectTotalPossible;
//           });
//           const overallPercentage =
//             overallTotalPossibleMarks > 0
//               ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//               : 0;
//           const overallGrade = calculateGrade(overallPercentage);
  
//           // Calculate overall term totals
//           const term1OverallTotalMarks = term1Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.marks : 0
//               })
//               return sum;
//           }, 0);
//           const term1OverallTotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.totalMarks : 0
//               })
//               return sum
//           }, 0);
//           const term2OverallTotalMarks = term2Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.marks : 0
//               })
//               return sum
//           }, 0);
//           const term2OverallTotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//               examResultsData?.marks?.forEach(subject => {
//                   const examResult = subject.examResults.find(res => res.examId === examId);
//                   sum += examResult ? examResult.totalMarks : 0
//               })
//               return sum;
//           }, 0);

//         return (
//             <div className="flex justify-center items-center p-3">
//                 <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
//                     <div className=" bg-white border  py-8 px-3">
//                         <div className=" px-1 py-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="h-[70px] w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center">
//                                     <h1 className="text-red-600 font-bold text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                 <div>
//                                     <table className=" text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                     {student?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {student?.class || "N/A"}-
//                                                     {student?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {student?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {student?.dateOfBirth
//                                                         ? new Date(student.dateOfBirth).toLocaleDateString(
//                                                             "en-GB",
//                                                             {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             }
//                                                         )
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             student?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-24 h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         <th
//                                             colSpan="4"
//                                             className="border border-l border-gray-300 p-2 text-center"
//                                         >
//                                             TERM-I
//                                         </th>
//                                         {showTerm2 && (
//                                             <th
//                                                 colSpan="4"
//                                                 className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 TERM-II
//                                             </th>
//                                         )}
//                                         <th
//                                             // colSpan="3"
//                                             colSpan={term1Exams.length}
//                                             className="border border-gray-300 p-2 text-center"
//                                         >
//                                             GRAND TOTAL
//                                         </th>
//                                     </tr>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                         {term1Exams.map((examId) => {
//                                             const exam = examData.find((ex) => ex._id === examId);
//                                             return (
//                                                 exam && (
//                                                     <th key={examId} className="border border-gray-300 p-2">
//                                                         {exam.name}
//                                                     </th>
//                                                 )
//                                             );
//                                         })}
//                                          {term1Exams.length > 0 ? (
//                                                 <th className="border border-gray-300 p-2">TOTAL</th>
//                                               ) : null}
//                                         {showTerm2 &&
//                                             term2Exams.map((examId) => {
//                                                 const exam = examData.find((ex) => ex._id === examId);
//                                                 return (
//                                                     exam && (
//                                                         <th key={examId} className="border border-gray-300 p-2">
//                                                             {exam.name}
//                                                         </th>
//                                                     )
//                                                 );
//                                             })}
//                                          {showTerm2 && term2Exams.length > 0 ? (
//                                               <th className="border border-gray-300 p-2">TOTAL</th>
//                                             ) : null}
//                                         <th className="border border-gray-300 p-2">TOTAL</th>
//                                         <th className="border border-gray-300 p-2">%</th>
//                                         <th className="border border-gray-300 p-2">GRADE</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {examResultsData?.marks?.map((subject, index) => {
//                                           const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                           const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                                               const examResult = subject.examResults.find((res) => res.examId === examId);
//                                               return sum + (examResult ? examResult.totalMarks : 0);
//                                           }, 0);
//                                           const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                                             return sum + (examResult ? examResult.marks : 0);
//                                         }, 0);
//                                           const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                                                 const examResult = subject.examResults.find((res) => res.examId === examId);
//                                                 return sum + (examResult ? examResult.totalMarks : 0);
//                                             }, 0);
                                          
//                                       const totalMarks = subject?.examResults?.reduce(
//                                         (sum, result) => sum + (result?.marks || 0),
//                                         0
//                                       );
//                                       const totalPossible = subject?.examResults?.reduce(
//                                         (sum, result) => sum + (result?.totalMarks || 0),
//                                         0
//                                       );
//                                       const percentage =
//                                         totalPossible > 0
//                                           ? (totalMarks / totalPossible) * 100
//                                           : 0;
  
//                                       return (
//                                         <tr
//                                           key={index}
//                                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                         >
//                                           <td className="border border-gray-300 p-2">
//                                             {subject?.subjectName}
//                                           </td>
//                                           {term1Exams.map((examId) => {
//                                             const examResult = subject?.examResults?.find(
//                                               (result) => result.examId === examId
//                                             );
//                                             return (
//                                               <td
//                                                 key={examId}
//                                                 className="border border-gray-300 p-2 text-center"
//                                               >
//                                                 {examResult ? examResult?.marks : "-/-"}
//                                               </td>
//                                             );
//                                           })}
//                                            {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                                             {showTerm2 && term2Exams.map((examId) => {
//                                                 const examResult = subject?.examResults?.find(
//                                                     (result) => result.examId === examId
//                                                 );
//                                                 return (
//                                                     <td
//                                                     key={examId}
//                                                     className="border border-gray-300 p-2 text-center"
//                                                     >
//                                                     {examResult ? examResult?.marks : "-/-"}
//                                                     </td>
//                                                 );
//                                                 })}
//                                                {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {totalMarks}
//                                           </td>
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {percentage?.toFixed(2)}%
//                                           </td>
//                                           <td className="border border-gray-300 p-2 text-center">
//                                             {calculateGrade(percentage)}
//                                           </td>
//                                         </tr>
//                                       );
//                                     })}
//                                       <tr className="font-semibold bg-gray-200">
//                                           <td className="border border-gray-300 p-2">Overall Total</td>
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}</td> : null}
//                                           {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}</td> : null}
//                                           {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}</td>) : null}
//                                           <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                           <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                                       </tr>
//                                 </tbody>
//                             </table>
//                             <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                 <thead>
//                                     <tr className="bg-gray-200">
//                                         <th className="border border-gray-300 p-2">Activity</th>
//                                         <th className="border border-gray-300 p-2">Grade</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {coScholasticData?.map((activity, index) => (
//                                         <tr key={index}>
//                                             <td className="border border-gray-300 p-2">
//                                                 {activity?.activityName}
//                                             </td>
//                                             <td className="border border-gray-300 p-2 text-center">
//                                                 {activity?.grade}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             {Object.keys(overAll).length > 0 && (
//                                 <div className="mt-2">
//                                     <p>
//                                         <b>Total Marks:</b> {overAll.totalMarks}
//                                     </p>
//                                     <p>
//                                         <b>Percentage:</b> {overAll.percentage?.toFixed(2)}%
//                                     </p>
//                                     <p>
//                                         <b>Grade:</b> {overAll.grade}
//                                     </p>
//                                      <p>
//                                         <b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}
//                                     </p>
//                                 </div>
//                             )}
//                             <div className="mb-6">
//                                 <div>
//                                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                     <p>Excellent performance. Keep up the good work!</p>
//                                 </div>
//                             </div>
//                             <div className="mt-8 flex justify-between text-sm">
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Class Teacher's Signature</div>
//                                 </div>
//                                 <div>
//                                     <div className="mb-8"></div>
//                                     <div>Principal's Signature</div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={
//                                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//                             }
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className="">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [overallData, setOverallData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.fullName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   useEffect(() => {
//     if (!selectedStudent || marks.length === 0) {
//       setExamResults([]);
//       setCoScholasticMarks([]);
//       setOverallData({});
//       return;
//     }

//     if (isAllStudentsSelected) {
//       setExamResults([]);
//       setCoScholasticMarks([]);
//       setOverallData({});
//       return;
//     }

//     const studentMarks = marks.filter(
//       (mark) => mark?.studentId?._id === selectedStudent?._id
//     );
//     const filteredMarks = studentMarks.filter((mark) =>
//       selectedExams.includes(mark.examId)
//     );

//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//         const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//         if (!existingMark) {
//           acc?.push({
//             ...mark,
//             examResults: [
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ],
//           });
//         } else {
//           existingMark.examResults = [
//             ...existingMark.examResults,
//             {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//             },
//           ];
//         }
//       });
//       return acc;
//     }, []);

//     setExamResults({ marks: combinedResults });

//     const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//     const lastSelectedExamMarks = filteredMarks.find(
//       (mark) => mark.examId === lastSelectedExamId
//     );

//     const coScholasticData = lastSelectedExamMarks
//       ? lastSelectedExamMarks.coScholasticMarks
//       : [];
//     setCoScholasticMarks(coScholasticData);

//     const overAll = lastSelectedExamMarks
//       ? {
//           totalMarks: lastSelectedExamMarks.totalMarks,
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade,
//         }
//       : {};
//     setOverallData(overAll);

//     const updatedExamNames = examData
//       .filter((ex) => selectedExams.includes(ex._id))
//       .map((ex) => ex.name);
//     setExamName(updatedExamNames.reverse());
//   }, [marks, selectedStudent, selectedExams, isAllStudentsSelected]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       let updatedSelectedExams;

//       if (isExamSelected) {
//         updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//       } else {
//         updatedSelectedExams = [...prevSelected, exam._id];
//       }
//       return updatedSelectedExams;
//     });
//   };

//   const handleStudentChange = (e) => {
//     const selectedValue = e.target.value;
//     if (selectedValue === "all") {
//       setSelectedStudent(null);
//       setIsAllStudentsSelected(true);
//     } else {
//       const selected = allStudents.find(
//         (student) => student?._id === selectedValue
//       );
//       setSelectedStudent(selected);
//       setIsAllStudentsSelected(false);
//     }
//   };
//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   const renderReportCard = (student) => {
//     const studentMarks = marks.filter(
//       (mark) => mark?.studentId?._id === student?._id
//     );
//     const filteredMarks = studentMarks.filter((mark) =>
//       selectedExams.includes(mark.examId)
//     );
// console.log("filteredMarks",filteredMarks)
//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//         const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//         if (!existingMark) {
//           acc?.push({
//             ...mark,
//             examResults: [
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ],
//           });
//         } else {
//           existingMark.examResults = [
//             ...existingMark.examResults,
//             {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//             },
//           ];
//         }
//       });
//       return acc;
//     }, []);

//     const examResultsData = { marks: combinedResults };

//     const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//     const lastSelectedExamMarks = filteredMarks.find(
//       (mark) => mark.examId === lastSelectedExamId
//     );
// console.log("lastSelectedExamMarks",lastSelectedExamMarks)
//     const coScholasticData = lastSelectedExamMarks
//       ? lastSelectedExamMarks.coScholasticMarks
//       : [];

//     const overAll = lastSelectedExamMarks
//       ? {
//           totalMarks: lastSelectedExamMarks.totalMarks,
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade,
//         }
//       : {};
//       const term1Exams = selectedExams.slice(0, 3);
//       const term2Exams = selectedExams.slice(3, 6);
//         const allExams = selectedExams;
//       const showTerm2 = selectedExams.length >= 4;
//     // Calculate overall totals
//     let overallTotalMarks = 0;
//     let overallTotalPossibleMarks = 0;
//     examResultsData?.marks?.forEach((subject) => {
//       const subjectTotalMarks = subject?.examResults?.reduce(
//         (sum, result) => sum + (result?.marks || 0),
//         0
//       );
//       const subjectTotalPossible = subject?.examResults?.reduce(
//         (sum, result) => sum + (result?.totalMarks || 0),
//         0
//       );
//       overallTotalMarks += subjectTotalMarks;
//       overallTotalPossibleMarks += subjectTotalPossible;
//     });
//     const overallPercentage =
//       overallTotalPossibleMarks > 0
//         ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//         : 0;
//     const overallGrade = calculateGrade(overallPercentage);

//     // Calculate overall term totals
//     const term1OverallTotalMarks = term1Exams.reduce((sum, examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             sum += examResult ? examResult.marks : 0
//         })
//         return sum;
//     }, 0);
//     const term1OverallTotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             sum += examResult ? examResult.totalMarks : 0
//         })
//         return sum
//     }, 0);
//     const term2OverallTotalMarks = term2Exams.reduce((sum, examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             sum += examResult ? examResult.marks : 0
//         })
//         return sum
//     }, 0);
//     const term2OverallTotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//         examResultsData?.marks?.forEach(subject => {
//             const examResult = subject.examResults.find(res => res.examId === examId);
//             sum += examResult ? examResult.totalMarks : 0
//         })
//         return sum;
//     }, 0);

//     return (
//       <div className="flex justify-center items-center p-3">
//         <div className="w-[210mm] h-[273mm]   mx-auto " key={student?._id}>
//           <div className=" bg-white border  py-8 px-3">
//             <div className=" px-1 py-8">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="h-[70px] w-[70px]">
//                   <img
//                     src={schoolImage}
//                     alt="School Logo"
//                     className="w-full object-contain"
//                   />
//                 </div>
//                 <div className="text-center">
//                   <h1 className="text-red-600 font-bold text-3xl">
//                     {SchoolDetails?.schoolName}
//                   </h1>
//                   <p className="text-blue-600 text-xl">
//                     {SchoolDetails?.address}
//                   </p>
//                   <p className="text-green-600 text-sm font-bold">
//                     {SchoolDetails?.email}
//                   </p>
//                   <p className="text-green-600 text-sm font-bold">
//                     {SchoolDetails?.contact}
//                   </p>
//                 </div>
//                 <div className="w-[70px]"></div>
//               </div>

//               <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                 <div>
//                   <table className=" text-sm">
//                     <tbody>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Admission No. :
//                         </td>
//                         <td className="whitespace-nowrap to-blue-700 font-semibold">
//                           {student?.admissionNumber || "N/A"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Student's Name :
//                         </td>
//                         <td className="whitespace-nowrap">
//                           {student?.fullName || "N/A"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Father's Name :
//                         </td>
//                         <td className="whitespace-nowrap">
//                           {student?.fatherName || "N/A"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Mother's Name :
//                         </td>
//                         <td className="whitespace-nowrap">
//                           {student?.motherName || "N/A"}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div>
//                   <table className="ml-3 text-sm">
//                     <tbody>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Class :
//                         </td>
//                         <td>
//                           {student?.class || "N/A"}-
//                           {student?.section || ""}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="font-semibold py-1 whitespace-nowrap">
//                           Roll No. :
//                         </td>
//                         <td className="whitespace-nowrap">
//                           {student?.rollNo || "N/A"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="font-semibold py-1">DOB :</td>
//                         <td>
//                           {student?.dateOfBirth
//                             ? new Date(student.dateOfBirth).toLocaleDateString(
//                                 "en-GB",
//                                 {
//                                   day: "2-digit",
//                                   month: "2-digit",
//                                   year: "numeric",
//                                 }
//                               )
//                             : "N/A"}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex justify-end ">
//                   <img
//                     src={
//                       student?.image?.url ||
//                       "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                     }
//                     alt="Student"
//                     className="w-24 h-24 object-cover border border-gray-300 "
//                   />
//                 </div>
//               </div>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                 <thead>
//                   <tr>
//                     <th></th>
//                     <th
//                       colSpan="4"
//                       className="border border-l border-gray-300 p-2 text-center"
//                     >
//                       TERM-I
//                     </th>
//                     {showTerm2 && (
//                       <th
//                         colSpan="4"
//                         className="border border-gray-300 p-2 text-center"
//                       >
//                         TERM-II
//                       </th>
//                     )}
//                     <th
//                       // colSpan="3"
//                       colSpan={term1Exams.length}
//                       className="border border-gray-300 p-2 text-center"
//                     >
//                       GRAND TOTAL
//                     </th>
//                   </tr>
//                   {/* <tr>
//                           <th></th>
//                           <th colSpan={term1Exams?.length > 0 ? term1Exams?.length+1 : 0} >TERM-I</th>
//                            {showTerm2 &&  (
//                                  <th colSpan={term2Exams?.length > 0 ? term2Exams?.length+1 : 0}>TERM-II</th>)}
//                            <th>GRAND TOTAL</th>
//                         </tr> */}
//                   <tr className="bg-gray-200">
//                     <th className="border border-gray-300 p-2">SUBJECTS</th>
//                     {term1Exams.map((examId) => {
//                       const exam = examData.find((ex) => ex._id === examId);
//                       return (
//                         exam && (
//                           <th key={examId} className="border border-gray-300 p-2">
//                             {exam.name}
//                           </th>
//                         )
//                       );
//                     })}
//                     {term1Exams.length > 0 ? (
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                     ) : null}
//                     {showTerm2 &&
//                       term2Exams.map((examId) => {
//                         const exam = examData.find((ex) => ex._id === examId);
//                         return (
//                           exam && (
//                             <th key={examId} className="border border-gray-300 p-2">
//                               {exam.name}
//                             </th>
//                           )
//                         );
//                       })}
//                     {showTerm2 && term2Exams.length > 0 ? (
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                     ) : null}
//                     <th className="border border-gray-300 p-2">TOTAL</th>
//                     <th className="border border-gray-300 p-2">%</th>
//                     <th className="border border-gray-300 p-2">GRADE</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {examResultsData?.marks?.map((subject, index) => {
//                       const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                         const examResult = subject.examResults.find((res) => res.examId === examId);
//                         return sum + (examResult ? examResult.marks : 0);
//                     }, 0);
//                       const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                           const examResult = subject.examResults.find((res) => res.examId === examId);
//                           return sum + (examResult ? examResult.totalMarks : 0);
//                       }, 0);
//                       const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                         const examResult = subject.examResults.find((res) => res.examId === examId);
//                         return sum + (examResult ? examResult.marks : 0);
//                     }, 0);
//                       const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                             const examResult = subject.examResults.find((res) => res.examId === examId);
//                             return sum + (examResult ? examResult.totalMarks : 0);
//                         }, 0);
                        
//                     const totalMarks = subject?.examResults?.reduce(
//                       (sum, result) => sum + (result?.marks || 0),
//                       0
//                     );
//                     const totalPossible = subject?.examResults?.reduce(
//                       (sum, result) => sum + (result?.totalMarks || 0),
//                       0
//                     );
//                     const percentage =
//                       totalPossible > 0
//                         ? (totalMarks / totalPossible) * 100
//                         : 0;

//                     return (
//                       <tr
//                         key={index}
//                         className={index % 2 === 0 ? "bg-gray-100" : ""}
//                       >
//                         <td className="border border-gray-300 p-2">
//                           {subject?.subjectName}
//                         </td>
//                         {term1Exams.map((examId) => {
//                           const examResult = subject?.examResults?.find(
//                             (result) => result.examId === examId
//                           );
//                           return (
//                             <td
//                               key={examId}
//                               className="border border-gray-300 p-2 text-center"
//                             >
//                               {examResult ? examResult?.marks : "-/-"}
//                             </td>
//                           );
//                         })}
//                         {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                           {showTerm2 && term2Exams.map((examId) => {
//                             const examResult = subject?.examResults?.find(
//                               (result) => result.examId === examId
//                             );
//                             return (
//                               <td
//                                 key={examId}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult ? examResult?.marks : "-/-"}
//                               </td>
//                             );
//                           })}
//                            {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
//                         <td className="border border-gray-300 p-2 text-center">
//                           {totalMarks}
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           {percentage?.toFixed(2)}%
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           {calculateGrade(percentage)}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                      <tr className="font-semibold bg-gray-200">
//                                 <td className="border border-gray-300 p-2">Overall Total</td>
//                                 {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}</td> : null}
//                                 {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}</td> : null}
//                                 {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}</td> : null}
//                                 {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}</td>) : null}
//                                 <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                 <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                 <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                             </tr>
//                 </tbody>
//               </table>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="border border-gray-300 p-2">Activity</th>
//                     <th className="border border-gray-300 p-2">Grade</th>
//                   </tr>
//                 </thead>
// {
//   console.log("coScholasticData",coScholasticData)
// }
//                 <tbody>
//                   {coScholasticData?.map((activity, index) => (
//                     <tr key={index}>
//                       <td className="border border-gray-300 p-2">
//                         {activity?.activityName}
//                       </td>
//                       <td className="border border-gray-300 p-2 text-center">
//                         {activity?.grade}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {Object.keys(overAll).length > 0 && (
//                 <div className="mt-2">
//                   <p>
//                     <b>Total Marks:</b> {overallTotalMarks}
//                     {/* <b>Total Marks:</b> {overAll.totalMarks} */}
//                   </p>
//                   <p>
//                     <b>Percentage:</b> {overallPercentage.toFixed(2)}%
//                     {/* <b>Percentage:</b> {overAll.percentage}% */}
//                   </p>
//                   <p>
//                     <b>Grade:</b>{overallGrade}
//                   </p>
//                   <p>
//                     <b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}
//                   </p>
//                 </div>
//               )}
//               <div className="mb-6">
//                 <div>
//                   <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                   <p>Excellent performance. Keep up the good work!</p>
//                 </div>
//               </div>
//               <div className="mt-8 flex justify-between text-sm">
//                 <div>
//                   <div className="mb-8"></div>
//                   <div>Class Teacher's Signature</div>
//                 </div>
//                 <div>
//                   <div className="mb-8"></div>
//                   <div>Principal's Signature</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//             <select
//               className="p-2 border rounded"
//               onChange={handleStudentChange}
//               value={
//                 isAllStudentsSelected ? "all" : selectedStudent?._id || ""
//               }
//             >
//               <option value="">Select a student</option>
//               <option value="all">All Students</option>
//               {allStudents.map((student) => (
//                 <option key={student?._id} value={student?._id}>
//                   {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                   (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>

//       <div ref={componentPDF} className="">
//         {isAllStudentsSelected ? (
//           allStudents.map((student) => renderReportCard(student))
//         ) : (
//           selectedStudent && renderReportCard(selectedStudent)
//         )}
//       </div>
//       {loading && (
//         <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       )}
//     </>
//   );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.fullName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   useEffect(() => {
//     if (!selectedStudent || marks.length === 0) {
//       setExamResults([]);
//       setCoScholasticMarks([]);
//       setOverallData({});
//       return;
//     }

//     if(isAllStudentsSelected){
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         setOverallData({});
//          return;
//      }


//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//       const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//       const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//           acc?.push({
//               ...mark,
//               examResults: [
//               {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//               },
//               ],
//           });
//           } else {
//           existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//               },
//           ];
//           }
//       });
//       return acc;
//       }, []);

//       setExamResults({ marks: combinedResults });


//       const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//       const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);

//       const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//       setCoScholasticMarks(coScholasticData);


//       const overAll = lastSelectedExamMarks ?
//           {totalMarks :lastSelectedExamMarks.totalMarks,
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade}
//           :{}
//       setOverallData(overAll);


//       const updatedExamNames = examData
//       .filter((ex) => selectedExams.includes(ex._id))
//       .map((ex) => ex.name);
//       setExamName(updatedExamNames.reverse());
//   }, [marks, selectedStudent,selectedExams,isAllStudentsSelected]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       let updatedSelectedExams;

//       if (isExamSelected) {
//         updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//       } else {
//         updatedSelectedExams = [...prevSelected, exam._id];
//       }
//       return updatedSelectedExams;
//     });
//   };

//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//               (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//            setIsAllStudentsSelected(false)
//         }
//     }
//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   const renderReportCard = (student) => {
//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === student?._id);
//         const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));
  
//           const combinedResults = filteredMarks.reduce((acc, curr) => {
//               curr.marks.forEach((mark) => {
//               const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//               if (!existingMark) {
//                   acc?.push({
//                   ...mark,
//                   examResults: [
//                       {
//                       examId: curr.examId,
//                       marks: mark.marks,
//                       totalMarks: mark.totalMarks,
//                       },
//                   ],
//                   });
//               } else {
//                   existingMark.examResults = [
//                   ...existingMark.examResults,
//                   {
//                       examId: curr.examId,
//                       marks: mark.marks,
//                       totalMarks: mark.totalMarks,
//                   },
//                   ];
//               }
//               });
//               return acc;
//           }, []);
  
//           const examResultsData = { marks: combinedResults };
  
//       const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//       const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
  
//       const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
      
//       const overAll = lastSelectedExamMarks ? 
//       {totalMarks :lastSelectedExamMarks.totalMarks, 
//       percentage: lastSelectedExamMarks.percentage,
//       isPassed: lastSelectedExamMarks.isPassed,
//       grade: lastSelectedExamMarks.grade}
//     :{}
//       const term1Exams = selectedExams.slice(0, 3);
//       const term2Exams = selectedExams.slice(3, 6);
//         const allExams = selectedExams;
//       const showTerm2 = selectedExams.length >= 4;
//        // Calculate overall totals
//        let overallTotalMarks = 0;
//        let overallTotalPossibleMarks = 0;
//        examResultsData?.marks?.forEach((subject) => {
//            const subjectTotalMarks = subject?.examResults?.reduce(
//                (sum, result) => sum + (result?.marks || 0),
//                0
//            );
//            const subjectTotalPossible = subject?.examResults?.reduce(
//                (sum, result) => sum + (result?.totalMarks || 0),
//                0
//            );
//            overallTotalMarks += subjectTotalMarks;
//            overallTotalPossibleMarks += subjectTotalPossible;
//        });
//        const overallPercentage = overallTotalPossibleMarks > 0
//            ? (overallTotalMarks / overallTotalPossibleMarks) * 100
//            : 0;
//            const overallGrade = calculateGrade(overallPercentage);

//        // Calculate overall term totals
//        const term1OverallTotalMarks = term1Exams.reduce((sum, examId) => {
//             examResultsData?.marks?.forEach(subject => {
//                 const examResult = subject.examResults.find(res => res.examId === examId);
//                 sum += examResult ? examResult.marks : 0
//             })
//            return sum;
//        }, 0);
//        const term1OverallTotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//            examResultsData?.marks?.forEach(subject => {
//                const examResult = subject.examResults.find(res => res.examId === examId);
//                sum += examResult ? examResult.totalMarks : 0
//            })
//            return sum
//        }, 0);
//        const term2OverallTotalMarks = term2Exams.reduce((sum, examId) => {
//            examResultsData?.marks?.forEach(subject => {
//                const examResult = subject.examResults.find(res => res.examId === examId);
//                sum += examResult ? examResult.marks : 0
//            })
//            return sum
//        }, 0);
//        const term2OverallTotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//            examResultsData?.marks?.forEach(subject => {
//                const examResult = subject.examResults.find(res => res.examId === examId);
//                sum += examResult ? examResult.totalMarks : 0
//            })
//             return sum;
//        }, 0);


//     return (
//         <div className="flex justify-center items-center p-3">
//         <div className="w-[210mm] h-[273mm]   mx-auto "  key={student?._id}>
//         <div className=" bg-white border  py-8 px-3">
//             <div className=" px-1 py-8">
//             <div className="flex items-center justify-between mb-6">
//                     <div className="h-[70px] w-[70px]">
//                         <img
//                             src={schoolImage}
//                             alt="School Logo"
//                             className="w-full object-contain"
//                         />
//                     </div>
//                     <div className="text-center">
//                         <h1 className="text-red-600 font-bold text-3xl">
//                             {SchoolDetails?.schoolName}
//                         </h1>
//                         <p className="text-blue-600 text-xl">
//                             {SchoolDetails?.address}
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                             {SchoolDetails?.email}
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                             {SchoolDetails?.contact}
//                         </p>
//                     </div>
//                     <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                     <div>
//                         <table className=" text-sm">
//                             <tbody>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Admission No. :
//                                     </td>
//                                     <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                         {student?.admissionNumber || "N/A"}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Student's Name :
//                                     </td>
//                                     <td className="whitespace-nowrap">
//                                         {student?.fullName || "N/A"}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Father's Name :
//                                     </td>
//                                     <td className="whitespace-nowrap">
//                                         {student?.fatherName || "N/A"}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Mother's Name :
//                                     </td>
//                                     <td className="whitespace-nowrap">
//                                         {student?.motherName || "N/A"}
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>

//                     <div>
//                         <table className="ml-3 text-sm">
//                             <tbody>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Class :
//                                     </td>
//                                     <td>
//                                         {student?.class || "N/A"}-
//                                         {student?.section || ""}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                         Roll No. :
//                                     </td>
//                                     <td className="whitespace-nowrap">
//                                         {student?.rollNo || "N/A"}
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="font-semibold py-1">DOB :</td>
//                                     <td>
//                                         {student?.dateOfBirth
//                                             ? new Date(
//                                                 student.dateOfBirth
//                                             ).toLocaleDateString("en-GB", {
//                                                 day: "2-digit",
//                                                 month: "2-digit",
//                                                 year: "numeric",
//                                             })
//                                             : "N/A"}
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="flex justify-end ">
//                         <img
//                             src={
//                                 student?.image?.url ||
//                                 "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                             }
//                             alt="Student"
//                             className="w-24 h-24 object-cover border border-gray-300 "
//                         />
//                     </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                     <tr>
//                             {/* <th rowSpan="2" className="border border-gray-300 p-2">SUBJECTS</th> */}
//                             <th></th>
//                             <th colSpan="4" className="border border-l border-gray-300 p-2 text-center">TERM-I</th>
//                                 {showTerm2 && (
//                                     <th colSpan="4" className="border border-gray-300 p-2 text-center">
//                                          TERM-II
//                                     </th>
//                                 )}
//                             <th colSpan="3" className="border border-gray-300 p-2 text-center">GRAND TOTAL</th>
//                          </tr>
//                       {/* <tr>
//                           <th></th>
//                           <th colSpan={term1Exams?.length > 0 ? term1Exams?.length+1 : 0} >TERM-I</th>
//                            {showTerm2 &&  (
//                                  <th colSpan={term2Exams?.length > 0 ? term2Exams?.length+1 : 0}>TERM-II</th>)}
//                            <th>GRAND TOTAL</th>
//                         </tr> */}
//                         <tr className="bg-gray-200">
//                             <th className="border border-gray-300 p-2">SUBJECTS</th>
//                               {term1Exams.map((examId) => {
//                                 const exam = examData.find((ex) => ex._id === examId);
//                                   return (
//                                     exam && ( <th key={examId} className="border border-gray-300 p-2">{exam.name}</th>)
//                                 );
//                             })}
//                             {term1Exams.length > 0 ? (<th className="border border-gray-300 p-2">TOTAL</th>) : null}
//                              {showTerm2 && term2Exams.map((examId) => {
//                                       const exam = examData.find((ex) => ex._id === examId);
//                                     return (
//                                         exam && (
//                                            <th key={examId} className="border border-gray-300 p-2">{exam.name}</th>
//                                         )
//                                     );
//                                 })}
//                              {showTerm2 && term2Exams.length > 0 ? (<th className="border border-gray-300 p-2">TOTAL</th>): null}
//                             <th className="border border-gray-300 p-2">TOTAL</th>
//                             <th className="border border-gray-300 p-2">%</th>
//                             <th className="border border-gray-300 p-2">GRADE</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {examResultsData?.marks?.map((subject, index) => {
                          
//                             const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                                 const examResult = subject.examResults.find((res) => res.examId === examId);
//                                 return sum + (examResult ? examResult.marks : 0);
//                             }, 0);
//                             const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                                 const examResult = subject.examResults.find((res) => res.examId === examId);
//                                 return sum + (examResult ? examResult.totalMarks : 0);
//                             }, 0);
//                             const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                                 const examResult = subject.examResults.find((res) => res.examId === examId);
//                                 return sum + (examResult ? examResult.marks : 0);
//                             }, 0);
//                             const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                                   const examResult = subject.examResults.find((res) => res.examId === examId);
//                                   return sum + (examResult ? examResult.totalMarks : 0);
//                               }, 0);

//                             const totalMarks = subject?.examResults?.reduce(
//                                 (sum, result) => sum + (result?.marks || 0),
//                                 0
//                             );
//                             const totalPossible = subject?.examResults?.reduce(
//                                 (sum, result) => sum + (result?.totalMarks || 0),
//                                 0
//                             );
//                             const percentage =
//                                 totalPossible > 0
//                                     ? (totalMarks / totalPossible) * 100
//                                     : 0;
                            
//                             return (
//                                 <tr
//                                     key={index}
//                                     className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                 >
//                                     <td className="border border-gray-300 p-2">
//                                         {subject?.subjectName}
//                                     </td>
//                                   {term1Exams.map((examId) => {
//                                       const examResult = subject?.examResults?.find(
//                                         (result) =>
//                                           result.examId === examId
//                                       );
//                                       return (
//                                         <td
//                                           key={examId}
//                                           className="border border-gray-300 p-2 text-center"
//                                         >
//                                           {examResult ? examResult?.marks : "-/-"}
//                                         </td>
//                                       );
//                                     })}
//                                   {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                                   {showTerm2 && term2Exams.map((examId) => {
//                                         const examResult = subject?.examResults?.find(
//                                             (result) =>
//                                                 result.examId === examId
//                                         );
//                                         return (
//                                             <td
//                                             key={examId}
//                                             className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 {examResult ? examResult?.marks : "-/-"}
//                                             </td>
//                                         );
//                                     })}
//                                {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
                                    
//                                     <td className="border border-gray-300 p-2 text-center">
//                                         {totalMarks}
//                                     </td>
//                                     <td className="border border-gray-300 p-2 text-center">
//                                         {percentage?.toFixed(2)}%
//                                     </td>
//                                     <td className="border border-gray-300 p-2 text-center">
//                                         {calculateGrade(percentage)}
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                          <tr className="font-semibold bg-gray-200">
//                                 <td className="border border-gray-300 p-2">Overall Total</td>
//                                 {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center" colSpan={term1Exams.length}>{term1OverallTotalMarks}</td> : null}
//                                 {term1Exams.length > 0 ? <td className="border border-gray-300 p-2 text-center">{term1OverallTotalMarks}</td> : null}
//                                 {showTerm2 && term2Exams.length > 0 ?  <td className="border border-gray-300 p-2 text-center" colSpan={term2Exams.length}>{term2OverallTotalMarks}</td> : null}
//                                 {showTerm2 && term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2OverallTotalMarks}</td>) : null}
//                                 <td className="border border-gray-300 p-2 text-center">{overallTotalMarks}</td>
//                                 <td className="border border-gray-300 p-2 text-center">{overallPercentage.toFixed(2)}%</td>
//                                 <td className="border border-gray-300 p-2 text-center">{overallGrade}</td>
//                             </tr>
//                     </tbody>
//                 </table>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                         <tr className="bg-gray-200">
//                             <th className="border border-gray-300 p-2">Activity</th>
//                             <th className="border border-gray-300 p-2">Grade</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {coScholasticData?.map((activity, index) => (
//                             <tr key={index}>
//                                 <td className="border border-gray-300 p-2">
//                                     {activity?.activityName}
//                                 </td>
//                                 <td className="border border-gray-300 p-2 text-center">
//                                     {activity?.grade}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {Object.keys(overAll).length > 0 && (
//                       <div className="mt-2">
//                       <p><b>Total Marks:</b> {overAll.totalMarks}</p>
//                       <p><b>Percentage:</b> {overAll.percentage}%</p>
//                       <p><b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}</p>
                    
//                      </div>)}
//                 <div className="mb-6">
                    
//                     <div>
//                         <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                         <p>Excellent performance. Keep up the good work!</p>
//                     </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                     <div>
//                         <div className="mb-8"></div>
//                         <div>Class Teacher's Signature</div>
//                     </div>
//                     <div>
//                         <div className="mb-8"></div>
//                         <div>Principal's Signature</div>
//                     </div>
//                 </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//               <select
//                 className="p-2 border rounded"
//                 onChange={handleStudentChange}
//                 value={isAllStudentsSelected ? "all" : selectedStudent?._id || ""}
//               >
//                 <option value="">Select a student</option>
//                 <option value="all">All Students</option>
//                   {allStudents.map((student) => (
//                       <option key={student?._id} value={student?._id}>
//                         {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                         (Roll No: {student?.rollNo})
//                       </option>
//                   ))}
//               </select>

//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>

//       <div ref={componentPDF} className=" ">
//         {isAllStudentsSelected ? (
//           allStudents.map((student) => renderReportCard(student))
//         ) : (
//           selectedStudent && renderReportCard(selectedStudent)
//         )}
//       </div>
//       {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//       </div>}
//     </>
//   );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);


//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");


//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             isAllStudentsSelected
//                 ? "All_Students_Report_Cards"
//                 : selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });



//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     const getResult = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getResult();
//     }, []);

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                     {
//                         withCredentials: true,
//                         headers: { Authorization: `Bearer ${authToken}` },
//                     }
//                 );
//                 setExamData(response.data.exams);
//             } catch (error) {
//                 console.error("Error fetching exams:", error);
//             }
//         };
//         fetchExams();
//     }, [authToken]);


//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if(isAllStudentsSelected){
//            setExamResults([]);
//            setCoScholasticMarks([]);
//            setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//         const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//             const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//             if (!existingMark) {
//             acc?.push({
//                 ...mark,
//                 examResults: [
//                 {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                 },
//                 ],
//             });
//             } else {
//             existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//                 },
//             ];
//             }
//         });
//         return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });


//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);

//         const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//         setCoScholasticMarks(coScholasticData);


//         const overAll = lastSelectedExamMarks ?
//             {totalMarks :lastSelectedExamMarks.totalMarks,
//             percentage: lastSelectedExamMarks.percentage,
//             isPassed: lastSelectedExamMarks.isPassed,
//             grade: lastSelectedExamMarks.grade}
//             :{}
//         setOverallData(overAll);


//         const updatedExamNames = examData
//         .filter((ex) => selectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());
//     }, [marks, selectedStudent,selectedExams,isAllStudentsSelected]);




//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//             updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//             updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };



//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//               (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//            setIsAllStudentsSelected(false)
//         }
//     }

//     const calculateGrade = (percentage) => {
//         if (percentage >= 90) return "A+";
//         if (percentage >= 80) return "A";
//         if (percentage >= 70) return "B+";
//         if (percentage >= 60) return "B";
//         if (percentage >= 50) return "C";
//         return "F";
//     };


//     const renderReportCard = (student) => {
       
//          const studentMarks = marks.filter((mark) => mark?.studentId?._id === student?._id);
//          const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));

//            const combinedResults = filteredMarks.reduce((acc, curr) => {
//                curr.marks.forEach((mark) => {
//                const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                if (!existingMark) {
//                    acc?.push({
//                    ...mark,
//                    examResults: [
//                        {
//                        examId: curr.examId,
//                        marks: mark.marks,
//                        totalMarks: mark.totalMarks,
//                        },
//                    ],
//                    });
//                } else {
//                    existingMark.examResults = [
//                    ...existingMark.examResults,
//                    {
//                        examId: curr.examId,
//                        marks: mark.marks,
//                        totalMarks: mark.totalMarks,
//                    },
//                    ];
//                }
//                });
//                return acc;
//            }, []);

//            const examResultsData = { marks: combinedResults };

//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
    
//         const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
        
//         const overAll = lastSelectedExamMarks ? 
//         {totalMarks :lastSelectedExamMarks.totalMarks, 
//         percentage: lastSelectedExamMarks.percentage,
//         isPassed: lastSelectedExamMarks.isPassed,
//         grade: lastSelectedExamMarks.grade}
//       :{}

//         const term1Exams = selectedExams.slice(0, 3);
//         const term2Exams = selectedExams.slice(3, 6);
//         const allExams = selectedExams
      
//     return (
//           <div className="flex justify-center items-center p-3">
//             <div className="w-[210mm] h-[273mm]   mx-auto "  key={student?._id}>
//             <div className=" bg-white border  py-8 px-3">
//                 <div className=" px-1 py-8">
//                 <div className="flex items-center justify-between mb-6">
//                         <div className="h-[70px] w-[70px]">
//                             <img
//                                 src={schoolImage}
//                                 alt="School Logo"
//                                 className="w-full object-contain"
//                             />
//                         </div>
//                         <div className="text-center">
//                             <h1 className="text-red-600 font-bold text-3xl">
//                                 {SchoolDetails?.schoolName}
//                             </h1>
//                             <p className="text-blue-600 text-xl">
//                                 {SchoolDetails?.address}
//                             </p>
//                             <p className="text-green-600 text-sm font-bold">
//                                 {SchoolDetails?.email}
//                             </p>
//                             <p className="text-green-600 text-sm font-bold">
//                                 {SchoolDetails?.contact}
//                             </p>
//                         </div>
//                         <div className="w-[70px]"></div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                         <div>
//                             <table className=" text-sm">
//                                 <tbody>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Admission No. :
//                                         </td>
//                                         <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                             {student?.admissionNumber || "N/A"}
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Student's Name :
//                                         </td>
//                                         <td className="whitespace-nowrap">
//                                             {student?.fullName || "N/A"}
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Father's Name :
//                                         </td>
//                                         <td className="whitespace-nowrap">
//                                             {student?.fatherName || "N/A"}
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Mother's Name :
//                                         </td>
//                                         <td className="whitespace-nowrap">
//                                             {student?.motherName || "N/A"}
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div>
//                             <table className="ml-3 text-sm">
//                                 <tbody>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Class :
//                                         </td>
//                                         <td>
//                                             {student?.class || "N/A"}-
//                                             {student?.section || ""}
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td className="font-semibold py-1 whitespace-nowrap">
//                                             Roll No. :
//                                         </td>
//                                         <td className="whitespace-nowrap">
//                                             {student?.rollNo || "N/A"}
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td className="font-semibold py-1">DOB :</td>
//                                         <td>
//                                             {student?.dateOfBirth
//                                                 ? new Date(
//                                                     student.dateOfBirth
//                                                 ).toLocaleDateString("en-GB", {
//                                                     day: "2-digit",
//                                                     month: "2-digit",
//                                                     year: "numeric",
//                                                 })
//                                                 : "N/A"}
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="flex justify-end ">
//                             <img
//                                 src={
//                                     student?.image?.url ||
//                                     "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                 }
//                                 alt="Student"
//                                 className="w-24 h-24 object-cover border border-gray-300 "
//                             />
//                         </div>
//                     </div>

//                     <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                         <thead>
//                           <tr>
//                             <th></th>
//                             <th colSpan={term1Exams?.length > 0 ? term1Exams?.length+1 : 0} >TERM-I</th>
//                             <th colSpan={term2Exams?.length > 0 ? term2Exams?.length+1 : 0}>TERM-II</th>
//                             <th>GRAND TOTAL</th>
//                           </tr>
//                             <tr className="bg-gray-200">
//                                 <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                   {term1Exams.map((examId) => {
//                                     const exam = examData.find((ex) => ex._id === examId);
//                                       return (
//                                         exam && ( <th key={examId} className="border border-gray-300 p-2">{exam.name}</th>)
//                                     );
//                                 })}
//                                   {term1Exams.length > 0 ? (<th className="border border-gray-300 p-2">TOTAL</th>) : null}


//                                 {term2Exams.map((examId) => {
//                                       const exam = examData.find((ex) => ex._id === examId);
//                                     return (
//                                         exam && (
//                                            <th key={examId} className="border border-gray-300 p-2">{exam.name}</th>
//                                         )
//                                     );
//                                 })}
//                                   {term2Exams.length > 0 ? (<th className="border border-gray-300 p-2">TOTAL</th>): null}
                              
//                                 <th className="border border-gray-300 p-2">TOTAL</th>
//                                 <th className="border border-gray-300 p-2">%</th>
//                                 <th className="border border-gray-300 p-2">GRADE</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {examResultsData?.marks?.map((subject, index) => {
                                 
//                                 const term1TotalMarks = term1Exams.reduce((sum, examId) => {
//                                     const examResult = subject.examResults.find((res) => res.examId === examId);
//                                     return sum + (examResult ? examResult.marks : 0);
//                                 }, 0);
//                                 const term1TotalPossibleMarks = term1Exams.reduce((sum, examId) => {
//                                     const examResult = subject.examResults.find((res) => res.examId === examId);
//                                     return sum + (examResult ? examResult.totalMarks : 0);
//                                 }, 0);
//                                 const term2TotalMarks = term2Exams.reduce((sum, examId) => {
//                                     const examResult = subject.examResults.find((res) => res.examId === examId);
//                                     return sum + (examResult ? examResult.marks : 0);
//                                 }, 0);
//                                 const term2TotalPossibleMarks = term2Exams.reduce((sum, examId) => {
//                                       const examResult = subject.examResults.find((res) => res.examId === examId);
//                                       return sum + (examResult ? examResult.totalMarks : 0);
//                                   }, 0);

//                                 const totalMarks = subject?.examResults?.reduce(
//                                     (sum, result) => sum + (result?.marks || 0),
//                                     0
//                                 );
//                                 const totalPossible = subject?.examResults?.reduce(
//                                     (sum, result) => sum + (result?.totalMarks || 0),
//                                     0
//                                 );
//                                 const percentage =
//                                     totalPossible > 0
//                                         ? (totalMarks / totalPossible) * 100
//                                         : 0;
                                    
//                                 return (
//                                     <tr
//                                         key={index}
//                                         className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                     >
//                                         <td className="border border-gray-300 p-2">
//                                             {subject?.subjectName}
//                                         </td>
//                                     {term1Exams.map((examId) => {
//                                         const examResult = subject?.examResults?.find(
//                                           (result) =>
//                                             result.examId === examId
//                                         );
//                                         return (
//                                           <td
//                                             key={examId}
//                                             className="border border-gray-300 p-2 text-center"
//                                           >
//                                             {examResult ? examResult?.marks : "-/-"}
//                                           </td>
//                                         );
//                                       })}
//                                   {term1Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term1TotalMarks}</td>) : null}
//                                     {term2Exams.map((examId) => {
//                                         const examResult = subject?.examResults?.find(
//                                             (result) =>
//                                                 result.examId === examId
//                                         );
//                                         return (
//                                             <td
//                                             key={examId}
//                                             className="border border-gray-300 p-2 text-center"
//                                             >
//                                                 {examResult ? examResult?.marks : "-/-"}
//                                             </td>
//                                         );
//                                     })}
//                                    {term2Exams.length > 0 ? (<td className="border border-gray-300 p-2 text-center">{term2TotalMarks}</td>) : null}
                                        
//                                         <td className="border border-gray-300 p-2 text-center">
//                                             {totalMarks}
//                                         </td>
//                                         <td className="border border-gray-300 p-2 text-center">
//                                             {percentage?.toFixed(2)}%
//                                         </td>
//                                         <td className="border border-gray-300 p-2 text-center">
//                                             {calculateGrade(percentage)}
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>

//                     <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                         <thead>
//                             <tr className="bg-gray-200">
//                                 <th className="border border-gray-300 p-2">Activity</th>
//                                 <th className="border border-gray-300 p-2">Grade</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {coScholasticData?.map((activity, index) => (
//                                 <tr key={index}>
//                                     <td className="border border-gray-300 p-2">
//                                         {activity?.activityName}
//                                     </td>
//                                     <td className="border border-gray-300 p-2 text-center">
//                                         {activity?.grade}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                     {Object.keys(overAll).length > 0 && (
//                           <div className="mt-2">
//                           <p><b>Total Marks:</b> {overAll.totalMarks}</p>
//                           <p><b>Percentage:</b> {overAll.percentage}%</p>
//                           <p><b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}</p>
                        
//                          </div>)}
//                     <div className="mb-6">
                        
//                         <div>
//                             <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                             <p>Excellent performance. Keep up the good work!</p>
//                         </div>
//                     </div>
//                     <div className="mt-8 flex justify-between text-sm">
//                         <div>
//                             <div className="mb-8"></div>
//                             <div>Class Teacher's Signature</div>
//                         </div>
//                         <div>
//                             <div className="mb-8"></div>
//                             <div>Principal's Signature</div>
//                         </div>
//                     </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//     )
//     }

//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 <div className="w-full flex">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleStudentChange}
//                             value={isAllStudentsSelected ? "all" : selectedStudent?._id || ""}
//                         >
//                             <option value="">Select a student</option>
//                             <option value="all">All Students</option>
//                             {allStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>

//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div ref={componentPDF} className=" ">
//                 {isAllStudentsSelected ? (
//                     allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
//             </div>
//             {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//               <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//             </div>}
//         </>
//     );
// };

// export default ReportCard;






// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [overallData, setOverallData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);


//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");


//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.fullName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });
  


//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);


//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if(isAllStudentsSelected){
//            setExamResults([]);
//            setCoScholasticMarks([]);
//            setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//         const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//             const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//             if (!existingMark) {
//             acc?.push({
//                 ...mark,
//                 examResults: [
//                 {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                 },
//                 ],
//             });
//             } else {
//             existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//                 },
//             ];
//             }
//         });
//         return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });


//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);

//         const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//         setCoScholasticMarks(coScholasticData);


//         const overAll = lastSelectedExamMarks ?
//             {totalMarks :lastSelectedExamMarks.totalMarks,
//             percentage: lastSelectedExamMarks.percentage,
//             isPassed: lastSelectedExamMarks.isPassed,
//             grade: lastSelectedExamMarks.grade}
//             :{}
//         setOverallData(overAll);


//         const updatedExamNames = examData
//         .filter((ex) => selectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//         setExamName(updatedExamNames.reverse());
//     }, [marks, selectedStudent,selectedExams,isAllStudentsSelected]);




//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//             updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//             updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };



//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//               (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//            setIsAllStudentsSelected(false)
//         }
//     }

//     const calculateGrade = (percentage) => {
//         if (percentage >= 90) return "A+";
//         if (percentage >= 80) return "A";
//         if (percentage >= 70) return "B+";
//         if (percentage >= 60) return "B";
//         if (percentage >= 50) return "C";
//         return "F";
//     };


//     const renderReportCard = (student) => {
//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === student?._id);
//     const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));

//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//         const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//         if (!existingMark) {
//           acc?.push({
//             ...mark,
//             examResults: [
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ],
//           });
//         } else {
//           existingMark.examResults = [
//             ...existingMark.examResults,
//             {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//             },
//           ];
//         }
//       });
//       return acc;
//     }, []);

//     const examResultsData = { marks: combinedResults };

//       const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//       const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
  
//       const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
      
//       const overAll = lastSelectedExamMarks ? 
//       {totalMarks :lastSelectedExamMarks.totalMarks, 
//       percentage: lastSelectedExamMarks.percentage,
//       isPassed: lastSelectedExamMarks.isPassed,
//       grade: lastSelectedExamMarks.grade}
//     :{}
      
//       return (
//         <div className="flex justify-center items-center p-3">
//            <div className="w-[210mm] h-[273mm]   mx-auto "  key={student?._id}>
//           {/* <div className=" border-2 px-6  max-w-4xl mx-auto  bg-blue-600"  key={student?._id}> */}
//              <div className=" bg-white border  py-8 px-3">
//              <div className=" px-1 py-8">
//              <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                       <img
//                           src={schoolImage}
//                           alt="School Logo"
//                           className="w-full object-contain"
//                       />
//                   </div>
//                   <div className="text-center">
//                       <h1 className="text-red-600 font-bold text-3xl">
//                           {SchoolDetails?.schoolName}
//                       </h1>
//                       <p className="text-blue-600 text-xl">
//                           {SchoolDetails?.address}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                           {SchoolDetails?.email}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                           {SchoolDetails?.contact}
//                       </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//               </div>

//               <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                   <div>
//                       <table className=" text-sm">
//                           <tbody>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Admission No. :
//                                   </td>
//                                   <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                       {student?.admissionNumber || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Student's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.fullName || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Father's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.fatherName || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Mother's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.motherName || "N/A"}
//                                   </td>
//                               </tr>
//                           </tbody>
//                       </table>
//                   </div>

//                   <div>
//                       <table className="ml-3 text-sm">
//                           <tbody>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Class :
//                                   </td>
//                                   <td>
//                                       {student?.class || "N/A"}-
//                                       {student?.section || ""}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Roll No. :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.rollNo || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1">DOB :</td>
//                                   <td>
//                                       {student?.dateOfBirth
//                                           ? new Date(
//                                               student.dateOfBirth
//                                           ).toLocaleDateString("en-GB", {
//                                               day: "2-digit",
//                                               month: "2-digit",
//                                               year: "numeric",
//                                           })
//                                           : "N/A"}
//                                   </td>
//                               </tr>
//                           </tbody>
//                       </table>
//                   </div>

//                   <div className="flex justify-end ">
//                       <img
//                           src={
//                               student?.image?.url ||
//                               "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                           }
//                           alt="Student"
//                           className="w-24 h-24 object-cover border border-gray-300 "
//                       />
//                   </div>
//               </div>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr>
//                       <th></th>
//                       <th>TERM-I</th>
//                       <th>TERM_II</th>
//                       <th>GRAND TOTAL</th>
//                     </tr>
//                       <tr className="bg-gray-200">

//                           <th className="border border-gray-300 p-2">SUBJECTS</th>
//                           {examName.map((name) => (
//                               <th key={name} className="border border-gray-300 p-2">
//                                   {name}
//                               </th>
//                           ))}
//                           <th className="border border-gray-300 p-2">TOTAL</th>
//                           <th className="border border-gray-300 p-2">%</th>
//                           <th className="border border-gray-300 p-2">GRADE</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       {examResultsData?.marks?.map((subject, index) => {
//                           const totalMarks = subject?.examResults?.reduce(
//                               (sum, result) => sum + (result?.marks || 0),
//                               0
//                           );
//                           const totalPossible = subject?.examResults?.reduce(
//                               (sum, result) => sum + (result?.totalMarks || 0),
//                               0
//                           );
//                           const percentage =
//                               totalPossible > 0
//                                   ? (totalMarks / totalPossible) * 100
//                                   : 0;

//                           return (
//                               <tr
//                                   key={index}
//                                   className={index % 2 === 0 ? "bg-gray-100" : ""}
//                               >
//                                   <td className="border border-gray-300 p-2">
//                                       {subject?.subjectName}
//                                   </td>
//                                   {examName?.map((name) => {
//                                       const examResult = subject?.examResults?.find(
//                                           (result) =>
//                                               examData?.find((exam) => exam.name === name)
//                                                   ?._id === result.examId
//                                       );
//                                       return (
//                                           <td
//                                               key={name}
//                                               className="border border-gray-300 p-2 text-center"
//                                           >
//                                               {examResult
//                                                   ? `${examResult?.marks}`
//                                                   : "-/-"}
//                                           </td>
//                                           // <td
//                                           //     key={name}
//                                           //     className="border border-gray-300 p-2 text-center"
//                                           // >
//                                           //     {examResult
//                                           //         ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                           //         : "-/-"}
//                                           // </td>
//                                       );
//                                   })}
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {totalMarks}
//                                   </td>
//                                   {/* <td className="border border-gray-300 p-2 text-center">
//                                       {totalMarks}/{totalPossible}
//                                   </td> */}
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {percentage?.toFixed(2)}%
//                                   </td>
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {calculateGrade(percentage)}
//                                   </td>
//                               </tr>
//                           );
//                       })}
//                   </tbody>
//               </table>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                       <tr className="bg-gray-200">
//                           <th className="border border-gray-300 p-2">Activity</th>
//                           <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                   </thead>

//                   <tbody>
//                       {coScholasticData?.map((activity, index) => (
//                           <tr key={index}>
//                               <td className="border border-gray-300 p-2">
//                                   {activity?.activityName}
//                               </td>
//                               <td className="border border-gray-300 p-2 text-center">
//                                   {activity?.grade}
//                               </td>
//                           </tr>
//                       ))}
//                   </tbody>
//               </table>
//               {Object.keys(overAll).length > 0 && (
//                     <div className="mt-2">
//                     <p><b>Total Marks:</b> {overAll.totalMarks}</p>
//                     <p><b>Percentage:</b> {overAll.percentage}%</p>
//                     <p><b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}</p>
                  
//                    </div>)}
//               <div className="mb-6">
                  
//                   <div>
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//               </div>
//               <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                       <div className="mb-8"></div>
//                       <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                       <div className="mb-8"></div>
//                       <div>Principal's Signature</div>
//                   </div>
//               </div>
//              </div>
//              </div>
//           </div>
//         </div>
         
//       )
//     }
    
//   return (
//     <>
//       <div className="mb-4 mx-auto">
       
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//               onClick={generatePDF}
//               className="text-2xl cursor-pointer"
//             />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//               <select
//                 className="p-2 border rounded"
//                 onChange={handleStudentChange}
//                 value={isAllStudentsSelected ? "all" : selectedStudent?._id || ""}
//               >
//                 <option value="">Select a student</option>
//                 <option value="all">All Students</option>
//                   {allStudents.map((student) => (
//                       <option key={student?._id} value={student?._id}>
//                         {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                         (Roll No: {student?.rollNo})
//                       </option>
//                   ))}
//               </select>

//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>


//       {/* <div className="w-full flex justify-center"> */}
//         {/* <div className=" bg-red-600"> */}
//         {/* <div className="a4 bg-red-600"> */}
//           {/* <div className="content border-2 m-1"> */}
//             <div ref={componentPDF} className=" ">
//             {/* <div ref={componentPDF} className="p-12"> */}
              
//                 {isAllStudentsSelected ? (
//                   allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
                
              
//             {/* </div> */}
//           {/* </div> */}
//         {/* </div> */}
//       </div>
//       {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//       </div>}
//     </>
//   );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [overallData, setOverallData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);


//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");


//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.fullName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });
  


//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);


//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         if(isAllStudentsSelected){
//            setExamResults([]);
//            setCoScholasticMarks([]);
//            setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//         const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//             const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//             if (!existingMark) {
//             acc?.push({
//                 ...mark,
//                 examResults: [
//                 {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                 },
//                 ],
//             });
//             } else {
//             existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//                 },
//             ];
//             }
//         });
//         return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });


//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);

//         const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//         setCoScholasticMarks(coScholasticData);


//         const overAll = lastSelectedExamMarks ?
//             {totalMarks :lastSelectedExamMarks.totalMarks,
//             percentage: lastSelectedExamMarks.percentage,
//             isPassed: lastSelectedExamMarks.isPassed,
//             grade: lastSelectedExamMarks.grade}
//             :{}
//         setOverallData(overAll);


//         const updatedExamNames = examData
//         .filter((ex) => selectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//         setExamName(updatedExamNames);
//     }, [marks, selectedStudent,selectedExams,isAllStudentsSelected]);




//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//             updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//             updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };



//     const handleStudentChange = (e) => {
//         const selectedValue = e.target.value;
//         if (selectedValue === "all") {
//             setSelectedStudent(null);
//             setIsAllStudentsSelected(true);
//         } else {
//             const selected = allStudents.find(
//               (student) => student?._id === selectedValue
//             );
//             setSelectedStudent(selected);
//            setIsAllStudentsSelected(false)
//         }
//     }

//     const calculateGrade = (percentage) => {
//         if (percentage >= 90) return "A+";
//         if (percentage >= 80) return "A";
//         if (percentage >= 70) return "B+";
//         if (percentage >= 60) return "B";
//         if (percentage >= 50) return "C";
//         return "F";
//     };


//     const renderReportCard = (student) => {
//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === student?._id);
//     const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));

//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//         const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//         if (!existingMark) {
//           acc?.push({
//             ...mark,
//             examResults: [
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ],
//           });
//         } else {
//           existingMark.examResults = [
//             ...existingMark.examResults,
//             {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//             },
//           ];
//         }
//       });
//       return acc;
//     }, []);

//     const examResultsData = { marks: combinedResults };

//       const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//       const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
  
//       const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
      
//       const overAll = lastSelectedExamMarks ? 
//       {totalMarks :lastSelectedExamMarks.totalMarks, 
//       percentage: lastSelectedExamMarks.percentage,
//       isPassed: lastSelectedExamMarks.isPassed,
//       grade: lastSelectedExamMarks.grade}
//     :{}
      
//       return (
//           <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6"  key={student?._id}>
//               <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                       <img
//                           src={schoolImage}
//                           alt="School Logo"
//                           className="w-full object-contain"
//                       />
//                   </div>
//                   <div className="text-center">
//                       <h1 className="text-red-600 font-bold text-3xl">
//                           {SchoolDetails?.schoolName}
//                       </h1>
//                       <p className="text-blue-600 text-xl">
//                           {SchoolDetails?.address}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                           {SchoolDetails?.email}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                           {SchoolDetails?.contact}
//                       </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//               </div>

//               <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                   <div>
//                       <table className=" text-sm">
//                           <tbody>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Admission No. :
//                                   </td>
//                                   <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                       {student?.admissionNumber || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Student's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.fullName || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Father's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.fatherName || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Mother's Name :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.motherName || "N/A"}
//                                   </td>
//                               </tr>
//                           </tbody>
//                       </table>
//                   </div>

//                   <div>
//                       <table className="ml-3 text-sm">
//                           <tbody>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Class :
//                                   </td>
//                                   <td>
//                                       {student?.class || "N/A"}-
//                                       {student?.section || ""}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1 whitespace-nowrap">
//                                       Roll No. :
//                                   </td>
//                                   <td className="whitespace-nowrap">
//                                       {student?.rollNo || "N/A"}
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td className="font-semibold py-1">DOB :</td>
//                                   <td>
//                                       {student?.dateOfBirth
//                                           ? new Date(
//                                               student.dateOfBirth
//                                           ).toLocaleDateString("en-GB", {
//                                               day: "2-digit",
//                                               month: "2-digit",
//                                               year: "numeric",
//                                           })
//                                           : "N/A"}
//                                   </td>
//                               </tr>
//                           </tbody>
//                       </table>
//                   </div>

//                   <div className="flex justify-end ">
//                       <img
//                           src={
//                               student?.image?.url ||
//                               "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                           }
//                           alt="Student"
//                           className="w-24 h-24 object-cover border border-gray-300 "
//                       />
//                   </div>
//               </div>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                       <tr className="bg-gray-200">
//                           <th className="border border-gray-300 p-2">SUBJECTS</th>
//                           {examName.map((name) => (
//                               <th key={name} className="border border-gray-300 p-2">
//                                   {name}
//                               </th>
//                           ))}
//                           <th className="border border-gray-300 p-2">TOTAL</th>
//                           <th className="border border-gray-300 p-2">%</th>
//                           <th className="border border-gray-300 p-2">GRADE</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       {examResultsData?.marks?.map((subject, index) => {
//                           const totalMarks = subject?.examResults?.reduce(
//                               (sum, result) => sum + (result?.marks || 0),
//                               0
//                           );
//                           const totalPossible = subject?.examResults?.reduce(
//                               (sum, result) => sum + (result?.totalMarks || 0),
//                               0
//                           );
//                           const percentage =
//                               totalPossible > 0
//                                   ? (totalMarks / totalPossible) * 100
//                                   : 0;

//                           return (
//                               <tr
//                                   key={index}
//                                   className={index % 2 === 0 ? "bg-gray-100" : ""}
//                               >
//                                   <td className="border border-gray-300 p-2">
//                                       {subject?.subjectName}
//                                   </td>
//                                   {examName?.map((name) => {
//                                       const examResult = subject?.examResults?.find(
//                                           (result) =>
//                                               examData?.find((exam) => exam.name === name)
//                                                   ?._id === result.examId
//                                       );
//                                       return (
//                                           <td
//                                               key={name}
//                                               className="border border-gray-300 p-2 text-center"
//                                           >
//                                               {examResult
//                                                   ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                                   : "-/-"}
//                                           </td>
//                                       );
//                                   })}
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {totalMarks}/{totalPossible}
//                                   </td>
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {percentage?.toFixed(2)}%
//                                   </td>
//                                   <td className="border border-gray-300 p-2 text-center">
//                                       {calculateGrade(percentage)}
//                                   </td>
//                               </tr>
//                           );
//                       })}
//                   </tbody>
//               </table>

//               <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                       <tr className="bg-gray-200">
//                           <th className="border border-gray-300 p-2">Activity</th>
//                           <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                   </thead>

//                   <tbody>
//                       {coScholasticData?.map((activity, index) => (
//                           <tr key={index}>
//                               <td className="border border-gray-300 p-2">
//                                   {activity?.activityName}
//                               </td>
//                               <td className="border border-gray-300 p-2 text-center">
//                                   {activity?.grade}
//                               </td>
//                           </tr>
//                       ))}
//                   </tbody>
//               </table>
//               {Object.keys(overAll).length > 0 && (
//                     <div className="mt-2">
//                     <p><b>Total Marks:</b> {overAll.totalMarks}</p>
//                     <p><b>Percentage:</b> {overAll.percentage}%</p>
//                     <p><b>Result:</b> {overAll.isPassed ? "Passed" : "Failed"}</p>
//                     {/* <p><b>Grade:</b> {overAll.grade}</p> */}
//                    </div>)}
//               <div className="mb-6">
                  
//                   <div>
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//               </div>
//               <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                       <div className="mb-8"></div>
//                       <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                       <div className="mb-8"></div>
//                       <div>Principal's Signature</div>
//                   </div>
//               </div>
//           </div>
//       )
//     }
    
//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//               onClick={generatePDF}
//               className="text-2xl cursor-pointer"
//             />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//               <select
//                 className="p-2 border rounded"
//                 onChange={handleStudentChange}
//                 value={isAllStudentsSelected ? "all" : selectedStudent?._id || ""}
//               >
//                 <option value="">Select a student</option>
//                 <option value="all">All Students</option>
//                   {allStudents.map((student) => (
//                       <option key={student?._id} value={student?._id}>
//                         {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                         (Roll No: {student?.rollNo})
//                       </option>
//                   ))}
//               </select>

//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>


//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
              
//                 {isAllStudentsSelected ? (
//                   allStudents.map((student) => renderReportCard(student))
//                 ) : (
//                     selectedStudent && renderReportCard(selectedStudent)
//                 )}
                
              
//             </div>
//           </div>
//         </div>
//       </div>
//       {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//       </div>}
//     </>
//   );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
  
//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  
//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");
  
//     const generatePDF = useReactToPrint({
//       content: () => componentPDF.current,
//       documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//       onAfterPrint: () => toast.success("Downloaded successfully"),
//     });
  
//     useEffect(() => {
//       const students = JSON.parse(localStorage.getItem("studentsData"));
//       setAllStudents(students || []);
//     }, []);
  
  
//     const getResult = async () => {
//       setLoading(true)
//       try {
//         const response = await axios.get(
//           // "https://eserver-i5sm.onrender.com/api/v1/marks/getStudentMarks",
//           "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setMarks(response.data.marks);
//       } catch (error) {
//         console.error("Error fetching marks:", error);
//       }finally{
//         setLoading(false)
//       }
//     };
  
//     useEffect(() => {
//       getResult();
//     }, []);
  
//     useEffect(() => {
//       const fetchExams = async () => {
//         try {
//           const response = await axios.get(
//             "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           );
//           setExamData(response.data.exams);
//         } catch (error) {
//           console.error("Error fetching exams:", error);
//         }
//       };
//       fetchExams();
//     }, [authToken]);
  
  
//     useEffect(() => {
//       if (!selectedStudent || marks.length === 0) {
//           setExamResults([]);
//           setCoScholasticMarks([]);
//           setOverallData({});
//           return;
//       }
  
//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//       const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));
  
  
//       const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//             acc?.push({
//               ...mark,
//               examResults: [
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ],
//             });
//           } else {
//             existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ];
//           }
//         });
//         return acc;
//       }, []);
  
//       setExamResults({ marks: combinedResults });
  
//        // Update coScholastic marks to only show last selected
//        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//        const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
     
//        const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//        setCoScholasticMarks(coScholasticData);
  
//        //set overall data
//         const overAll = lastSelectedExamMarks ? 
//           {totalMarks :lastSelectedExamMarks.totalMarks, 
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade}
//         :{}
//         setOverallData(overAll);

//        // Update exam names with newly selected exam
//        const updatedExamNames = examData
//        .filter((ex) => selectedExams.includes(ex._id))
//        .map((ex) => ex.name);
//       setExamName(updatedExamNames);
//     }, [marks, selectedStudent,selectedExams]);
  
  
  
//     const handleCheckboxChange = (exam) => {
//       setSelectedExams((prevSelected) => {
//         const isExamSelected = prevSelected.includes(exam._id);
//         let updatedSelectedExams;
    
//         if (isExamSelected) {
//           updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//         } else {
//           updatedSelectedExams = [...prevSelected, exam._id];
//         }
//         return updatedSelectedExams;
//       });
//     };
  
//     const calculateGrade = (percentage) => {
//       if (percentage >= 90) return "A+";
//       if (percentage >= 80) return "A";
//       if (percentage >= 70) return "B+";
//       if (percentage >= 60) return "B";
//       if (percentage >= 50) return "C";
//       return "F";
//     };
  
//     return (
//       <>
//         <div className="mb-4 mx-auto">
//           <div
//             className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//             style={{
//               background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//             }}
//           >
//             <p className="text-lg">Report Card</p>
//             <MdDownload
//               onClick={generatePDF}
//               className="text-2xl cursor-pointer"
//             />
//           </div>
//           <div className="w-full flex">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//               <select
//                 className="p-2 border rounded"
//                 onChange={(e) => {
//                   const selected = allStudents.find(
//                     (student) => student?._id === e.target.value
//                   );
//                   setSelectedStudent(selected);
//                 }}
//               >
//                 <option value="">Select a student</option>
//                 {allStudents.map((student) => (
//                   <option key={student?._id} value={student?._id}>
//                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                     (Roll No: {student?.rollNo})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//               <form className="flex gap-4 items-center justify-center border-2 p-2">
//                 {examData?.map((exam) => (
//                   <div key={exam._id} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id={exam?._id}
//                       value={exam?._id}
//                       checked={selectedExams.includes(exam?._id)}
//                       onChange={() => handleCheckboxChange(exam)}
//                       className="mr-2"
//                     />
//                     <label htmlFor={exam._id}>{exam.name}</label>
//                   </div>
//                 ))}
//               </form>
//             </div>
//           </div>
//         </div>
  
//         <div className="w-full flex justify-center">
//           <div className="a4">
//             <div className="content border-2 m-1">
//               <div ref={componentPDF} className="p-12">
//                 <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="h-[70px] w-[70px]">
//                       <img
//                         src={schoolImage}
//                         alt="School Logo"
//                         className="w-full object-contain"
//                       />
//                     </div>
//                     <div className="text-center">
//                       <h1 className="text-red-600 font-bold text-3xl">
//                         {SchoolDetails?.schoolName}
//                       </h1>
//                       <p className="text-blue-600 text-xl">
//                         {SchoolDetails?.address}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                         {SchoolDetails?.email}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                         {SchoolDetails?.contact}
//                       </p>
//                     </div>
//                     <div className="w-[70px]"></div>
//                   </div>
  
//                   <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                     <div>
//                       <table className=" text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Admission No. :
//                             </td>
//                             <td className="whitespace-nowrap to-blue-700 font-semibold">
//                               {selectedStudent?.admissionNumber || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Student's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.fullName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Father's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.fatherName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Mother's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.motherName || "N/A"}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
  
//                     <div>
//                       <table className="ml-3 text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Class :
//                             </td>
//                             <td>
//                               {selectedStudent?.class || "N/A"}-
//                               {selectedStudent?.section || ""}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Roll No. :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.rollNo || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">DOB :</td>
//                             <td>
//                               {selectedStudent?.dateOfBirth
//                                 ? new Date(
//                                     selectedStudent.dateOfBirth
//                                   ).toLocaleDateString("en-GB", {
//                                     day: "2-digit",
//                                     month: "2-digit",
//                                     year: "numeric",
//                                   })
//                                 : "N/A"}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
  
//                     <div className="flex justify-end ">
//                       <img
//                         src={
//                           selectedStudent?.image?.url ||
//                           "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                         }
//                         alt="Student"
//                         className="w-24 h-24 object-cover border border-gray-300 "
//                       />
//                     </div>
//                   </div>
  
//                   <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                         {examName.map((name) => (
//                           <th key={name} className="border border-gray-300 p-2">
//                             {name}
//                           </th>
//                         ))}
//                         <th className="border border-gray-300 p-2">TOTAL</th>
//                         <th className="border border-gray-300 p-2">%</th>
//                         <th className="border border-gray-300 p-2">GRADE</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {examResults?.marks?.map((subject, index) => {
//                         const totalMarks = subject?.examResults?.reduce(
//                           (sum, result) => sum + (result?.marks || 0),
//                           0
//                         );
//                         const totalPossible = subject?.examResults?.reduce(
//                           (sum, result) => sum + (result?.totalMarks || 0),
//                           0
//                         );
//                         const percentage =
//                           totalPossible > 0
//                             ? (totalMarks / totalPossible) * 100
//                             : 0;
  
//                         return (
//                           <tr
//                             key={index}
//                             className={index % 2 === 0 ? "bg-gray-100" : ""}
//                           >
//                             <td className="border border-gray-300 p-2">
//                               {subject?.subjectName}
//                             </td>
//                             {examName?.map((name) => {
//                               const examResult = subject?.examResults?.find(
//                                 (result) =>
//                                   examData?.find((exam) => exam.name === name)
//                                     ?._id === result.examId
//                               );
//                               return (
//                                 <td
//                                   key={name}
//                                   className="border border-gray-300 p-2 text-center"
//                                 >
//                                   {examResult
//                                     ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                     : "-/-"}
//                                 </td>
//                               );
//                             })}
//                             <td className="border border-gray-300 p-2 text-center">
//                               {totalMarks}/{totalPossible}
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {percentage?.toFixed(2)}%
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {calculateGrade(percentage)}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
  
//                   <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">Activity</th>
//                         <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                     </thead>
                  
//                     <tbody>
//                       {coScholasticMarks?.map((activity, index) => (
//                         <tr key={index}>
//                           <td className="border border-gray-300 p-2">
//                             {activity?.activityName}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {activity?.grade}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {Object.keys(overallData).length > 0 && (
//                     <div className="mt-2">
//                     <p><b>Total Marks:</b> {overallData.totalMarks}</p>
//                     <p><b>Percentage:</b> {overallData.percentage}%</p>
//                     <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
//                     {/* <p><b>Grade:</b> {overallData.grade}</p> */}
//                    </div>)}
//                   <div className="mb-6">
//                     {/* <div className="mb-4">
//                       <h4 className="font-semibold mb-1">Discipline</h4>
//                       <p>Grade: A</p>
//                     </div> */}
//                     <div>
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                     </div>
//                   </div>
//                   <div className="mt-8 flex justify-between text-sm">
//                     <div>
//                       <div className="mb-8"></div>
//                       <div>Class Teacher's Signature</div>
//                     </div>
//                     <div>
//                       <div className="mb-8"></div>
//                       <div>Principal's Signature</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//           </div>}
//       </>
//     );
//   };
  
//   export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const schoolName = localStorage.getItem("schoolName");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//     onAfterPrint: () => alert("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);


//   const getResult = async () => {
//     setLoading(true)
//     try {
//       const response = await axios.get(
//         // "https://eserver-i5sm.onrender.com/api/v1/marks/getStudentMarks",
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }finally{
//       setLoading(false)
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   useEffect(() => {
//     if (!selectedStudent || marks.length === 0) {
//         setExamResults([]);
//         setCoScholasticMarks([]);
//         return;
//     }

//     const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//     const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//     const combinedResults = filteredMarks.reduce((acc, curr) => {
//       curr.marks.forEach((mark) => {
//         const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//         if (!existingMark) {
//           acc?.push({
//             ...mark,
//             examResults: [
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ],
//           });
//         } else {
//           existingMark.examResults = [
//             ...existingMark.examResults,
//             {
//               examId: curr.examId,
//               marks: mark.marks,
//               totalMarks: mark.totalMarks,
//             },
//           ];
//         }
//       });
//       return acc;
//     }, []);

//     setExamResults({ marks: combinedResults });


//      // Update coScholastic marks to only show last selected
//      const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//      const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
   
//      const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//      setCoScholasticMarks(coScholasticData);


//      // Update exam names with newly selected exam
//      const updatedExamNames = examData
//      .filter((ex) => selectedExams.includes(ex._id))
//      .map((ex) => ex.name);
//     setExamName(updatedExamNames);
//   }, [marks, selectedStudent,selectedExams]);
  
//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       let updatedSelectedExams;
  
//       if (isExamSelected) {
//         updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//       } else {
//         updatedSelectedExams = [...prevSelected, exam._id];
//       }
//       return updatedSelectedExams;
//     });
//   };

//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white px-2 py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//             <select
//               className="p-2 border rounded"
//               onChange={(e) => {
//                 const selected = allStudents.find(
//                   (student) => student?._id === e.target.value
//                 );
//                 setSelectedStudent(selected);
//               }}
//             >
//               <option value="">Select a student</option>
//               {allStudents.map((student) => (
//                 <option key={student?._id} value={student?._id}>
//                   {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                   (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>

//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
//               <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                     <img
//                       src={schoolImage}
//                       alt="School Logo"
//                       className="w-full object-contain"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <h1 className="text-red-600 font-bold text-3xl">
//                       {SchoolDetails?.schoolName}
//                     </h1>
//                     <p className="text-blue-600 text-xl">
//                       {SchoolDetails?.address}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.email}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.contact}
//                     </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Admission No. :
//                           </td>
//                           <td className="whitespace-nowrap to-blue-700 font-semibold">
//                             {selectedStudent?.admissionNumber || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Student's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fullName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Father's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fatherName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Mother's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.motherName || "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div>
//                     <table className="ml-3 text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Class :
//                           </td>
//                           <td>
//                             {selectedStudent?.class || "N/A"}-
//                             {selectedStudent?.section || ""}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Roll No. :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.rollNo || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1">DOB :</td>
//                           <td>
//                             {selectedStudent?.dateOfBirth
//                               ? new Date(
//                                   selectedStudent.dateOfBirth
//                                 ).toLocaleDateString("en-GB", {
//                                   day: "2-digit",
//                                   month: "2-digit",
//                                   year: "numeric",
//                                 })
//                               : "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-end ">
//                     <img
//                       src={
//                         selectedStudent?.image?.url ||
//                         "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                       }
//                       alt="Student"
//                       className="w-24 h-24 object-cover border border-gray-300 "
//                     />
//                   </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">SUBJECTS</th>
//                       {examName.map((name) => (
//                         <th key={name} className="border border-gray-300 p-2">
//                           {name}
//                         </th>
//                       ))}
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                       <th className="border border-gray-300 p-2">%</th>
//                       <th className="border border-gray-300 p-2">GRADE</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {examResults?.marks?.map((subject, index) => {
//                       const totalMarks = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.marks || 0),
//                         0
//                       );
//                       const totalPossible = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.totalMarks || 0),
//                         0
//                       );
//                       const percentage =
//                         totalPossible > 0
//                           ? (totalMarks / totalPossible) * 100
//                           : 0;

//                       return (
//                         <tr
//                           key={index}
//                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                         >
//                           <td className="border border-gray-300 p-2">
//                             {subject?.subjectName}
//                           </td>
//                           {examName?.map((name) => {
//                             const examResult = subject?.examResults?.find(
//                               (result) =>
//                                 examData?.find((exam) => exam.name === name)
//                                   ?._id === result.examId
//                             );
//                             return (
//                               <td
//                                 key={name}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult
//                                   ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                   : "-/-"}
//                               </td>
//                             );
//                           })}
//                           <td className="border border-gray-300 p-2 text-center">
//                             {totalMarks}/{totalPossible}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {percentage?.toFixed(2)}%
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {calculateGrade(percentage)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">Activity</th>
//                       <th className="border border-gray-300 p-2">Grade</th>
//                     </tr>
//                   </thead>
                
//                   <tbody>
//                     {coScholasticMarks?.map((activity, index) => (
//                       <tr key={index}>
//                         <td className="border border-gray-300 p-2">
//                           {activity?.activityName}
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           {activity?.grade}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div className="mb-6">
//                   <div className="mb-4">
//                     <h4 className="font-semibold mb-1">Discipline</h4>
//                     <p>Grade: A</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                     <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Principal's Signature</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//        {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//          </div>}
//     </>
//   );
// };

// export default ReportCard;



// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const schoolName = localStorage.getItem("schoolName");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//     onAfterPrint: () => alert("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     try {
//       const response = await axios.get(
//         // "https://eserver-i5sm.onrender.com/api/v1/marks/getStudentMarks",
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//       console.log("response.data.exams",response.data.marks)
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
       
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       const updatedSelectedExams = isExamSelected
//         ? prevSelected.filter((id) => id !== exam._id)
//         : [...prevSelected, exam._id];

//       const updatedExamNames = examData
//         .filter((ex) => updatedSelectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//       setExamName(updatedExamNames);

//       // Filter and collect all selected exam results
//       const allSelectedResults = marks.filter((mark) =>
//         updatedSelectedExams.includes(mark.examId)
//       );

//       // Combine results from all selected terms
//       const combinedResults = {
//         marks: allSelectedResults.reduce((acc, curr) => {
//           curr.marks.forEach((mark) => {
//             const existingMark = acc.find(
//               (m) => m.subjectName === mark.subjectName
//             );
//             if (!existingMark) {
//               acc.push({
//                 ...mark,
//                 examResults: [
//                   {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                   },
//                 ],
//               });
//             } else {
//               existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ];
//             }
//           });
//           return acc;
//         }, []),
//       };

//       // Set the coScholastic marks dynamically
//       const coScholasticData = allSelectedResults.flatMap(
//         (result) => result.coScholasticMarks
//       );
//       setCoScholasticMarks(coScholasticData);

//       setExamResults(combinedResults);
//       return updatedSelectedExams;
//     });
//   };

//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white px-2 py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//             <select
//               className="p-2 border rounded"
//               onChange={(e) => {
//                 const selected = allStudents.find(
//                   (student) => student?._id === e.target.value
//                 );
//                 setSelectedStudent(selected);
//               }}
//             >
//               <option value="">Select a student</option>
//               {allStudents.map((student) => (
//                 <option key={student?._id} value={student?._id}>
//                   {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                   (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>

//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
//               <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                     <img
//                       src={schoolImage}
//                       alt="School Logo"
//                       className="w-full object-contain"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <h1 className="text-red-600 font-bold text-3xl">
//                       {SchoolDetails?.schoolName}
//                     </h1>
//                     <p className="text-blue-600 text-xl">
//                       {SchoolDetails?.address}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.email}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.contact}
//                     </p>
//                     {/* <p className="text-pink-500 text-lg font-bold mt-2">
//                       PROGRESS REPORT 2023-24
//                     </p> */}
//                   </div>
//                   <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         {console.log("selectedStudent", selectedStudent)}
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Admission No. :
//                           </td>
//                           <td className="whitespace-nowrap to-blue-700 font-semibold">
//                             {selectedStudent?.admissionNumber || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Student's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fullName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Father's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fatherName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Mother's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.motherName || "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div>
//                     <table className="ml-3 text-sm">
//                       <tbody>
//                         {/* <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Medium :</td>
//                           <td>Hindi</td>
//                         </tr> */}
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Class :
//                           </td>
//                           <td>
//                             {selectedStudent?.class || "N/A"}-
//                             {selectedStudent?.section || ""}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Roll No. :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.rollNo || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1">DOB :</td>
//                           <td>
//                             {selectedStudent?.dateOfBirth
//                               ? new Date(
//                                   selectedStudent.dateOfBirth
//                                 ).toLocaleDateString("en-GB", {
//                                   day: "2-digit",
//                                   month: "2-digit",
//                                   year: "numeric",
//                                 })
//                               : "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-end ">
//                     <img
//                       src={
//                         selectedStudent?.image?.url ||
//                         "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                       }
//                       alt="Student"
//                       className="w-24 h-24 object-cover border border-gray-300 "
//                     />
//                   </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">SUBJECTS</th>
//                       {examName.map((name) => (
//                         <th key={name} className="border border-gray-300 p-2">
//                           {name}
//                         </th>
//                       ))}
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                       <th className="border border-gray-300 p-2">%</th>
//                       <th className="border border-gray-300 p-2">GRADE</th>
//                     </tr>
//                   </thead>
//                   {console.log("examResults", examResults)}
//                   <tbody>
//                     {examResults?.marks?.map((subject, index) => {
//                       const totalMarks = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.marks || 0),
//                         0
//                       );
//                       const totalPossible = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.totalMarks || 0),
//                         0
//                       );
//                       const percentage =
//                         totalPossible > 0
//                           ? (totalMarks / totalPossible) * 100
//                           : 0;

//                       return (
//                         <tr
//                           key={index}
//                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                         >
//                           <td className="border border-gray-300 p-2">
//                             {subject?.subjectName}
//                           </td>
//                           {examName?.map((name) => {
//                             const examResult = subject?.examResults?.find(
//                               (result) =>
//                                 examData?.find((exam) => exam.name === name)
//                                   ?._id === result.examId
//                             );
//                             return (
//                               <td
//                                 key={name}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult
//                                   ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                   : "-/-"}
//                               </td>
//                             );
//                           })}
//                           <td className="border border-gray-300 p-2 text-center">
//                             {totalMarks}/{totalPossible}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {percentage?.toFixed(2)}%
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {calculateGrade(percentage)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">Activity</th>
//                       <th className="border border-gray-300 p-2">Grade</th>
//                     </tr>
//                   </thead>
                
//                   <tbody>
//                     {coScholasticMarks?.map((activity, index) => (
//                       <tr key={index}>
//                         <td className="border border-gray-300 p-2">
//                           {activity?.activityName}
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           {activity?.grade}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div className="mb-6">
//                   <div className="mb-4">
//                     <h4 className="font-semibold mb-1">Discipline</h4>
//                     <p>Grade: A</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                     <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Principal's Signature</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ReportCard;

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//     onAfterPrint: () => alert("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       const updatedSelectedExams = isExamSelected
//         ? prevSelected.filter((id) => id !== exam._id)
//         : [...prevSelected, exam._id];

//       const updatedExamNames = examData
//         .filter((ex) => updatedSelectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//       setExamName(updatedExamNames);

//       // Filter and collect all selected exam results
//       const allSelectedResults = marks.filter((mark) =>
//         updatedSelectedExams.includes(mark.examId)
//       );

//       // Combine results from all selected terms
//       const combinedResults = {
//         marks: allSelectedResults.reduce((acc, curr) => {
//           curr.marks.forEach((mark) => {
//             const existingMark = acc.find(
//               (m) => m.subjectName === mark.subjectName
//             );
//             if (!existingMark) {
//               acc.push({
//                 ...mark,
//                 examResults: [
//                   {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                   },
//                 ],
//               });
//             } else {
//               existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ];
//             }
//           });
//           return acc;
//         }, []),
//       };

//       setExamResults(combinedResults);
//       return updatedSelectedExams;
//     });
//   };

//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">

//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white px-2 py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//        <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//           <select
//             className=" p-2 border rounded"
//             onChange={(e) => {
//               const selected = allStudents.find(
//                 (student) => student._id === e.target.value
//               );
//               setSelectedStudent(selected);
//             }}
//           >
//             <option value="">Select a student</option>
//             {allStudents.map((student) => (
//               <option key={student._id} value={student._id}>
//                 {student.fullName} - Class {student.class} {student.section}{" "}
//                 (Roll No: {student.rollNo})
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//           <form className=" flex gap-4 items-center justify-center border-2 p-2 ">
//             {examData.map((exam) => (
//               <div key={exam._id} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id={exam._id}
//                   value={exam._id}
//                   checked={selectedExams.includes(exam._id)}
//                   onChange={() => handleCheckboxChange(exam)}
//                   className="mr-2"
//                 />
//                 <label htmlFor={exam._id}>{exam.name}</label>
//               </div>
//             ))}
//           </form>
//         </div>
//        </div>
//       </div>

//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
//               <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                 {/* Header Section */}
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                     <img
//                       src={schoolImage}
//                       alt="School Logo"
//                       className="w-full object-contain"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <h1 className="text-red-600 font-bold text-xl">
//                       R.K.S.V.M. INTER COLLEGE
//                     </h1>
//                     <p className="text-blue-600 text-sm">
//                       Makanpur Road, Nyay Khand-1st Indirapuram Gzb
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       U-DISE CODE 9100108110
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       SCHOOL AFFILIATION NO G.J.H-576
//                     </p>
//                     <p className="text-pink-500 text-lg font-bold mt-2">
//                       PROGRESS REPORT 2023-24
//                     </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 ">
//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Student's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.fullName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Father's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.fatherName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Mother's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.motherName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Class :</td>
//                           <td>{selectedStudent?.class || "N/A"}-{selectedStudent?.section || ""}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Medium :</td>
//                           <td>Hindi</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Roll No. :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.rollNo || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1">DOB :</td>
//                           {/* <td>{selectedStudent?.dateOfBirth || "N/A"}</td> */}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-end">
//                     <img
//                       src={selectedStudent?.image?.url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"}
//                       alt="Student"
//                       className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">SUBJECTS</th>
//                       {examName.map((name) => (
//                         <th key={name} className="border border-gray-300 p-2">
//                           {name}
//                         </th>
//                       ))}
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                       <th className="border border-gray-300 p-2">%</th>
//                       <th className="border border-gray-300 p-2">GRADE</th>
//                     </tr>
//                   </thead>
//                  { console.log("examResults",examResults)}
//                   <tbody>
//                     {examResults?.marks?.map((subject, index) => {
//                       const totalMarks = subject.examResults?.reduce(
//                         (sum, result) => sum + (result.marks || 0),
//                         0
//                       );
//                       const totalPossible = subject.examResults?.reduce(
//                         (sum, result) => sum + (result.totalMarks || 0),
//                         0
//                       );
//                       const percentage =
//                         totalPossible > 0
//                           ? (totalMarks / totalPossible) * 100
//                           : 0;

//                       return (
//                         <tr
//                           key={index}
//                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                         >
//                           <td className="border border-gray-300 p-2">
//                             {subject.subjectName}
//                           </td>
//                           {examName.map((name) => {
//                             const examResult = subject.examResults?.find(
//                               (result) =>
//                                 examData.find((exam) => exam.name === name)
//                                   ?._id === result.examId
//                             );
//                             return (
//                               <td
//                                 key={name}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult
//                                   ? `${examResult.marks}/${examResult.totalMarks}`
//                                   : "-/-"}
//                               </td>
//                             );
//                           })}
//                           <td className="border border-gray-300 p-2 text-center">
//                             {totalMarks}/{totalPossible}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {percentage.toFixed(2)}%
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {calculateGrade(percentage)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {/* Co-Scholastic Areas */}
//                 <div className="mb-6">
//                   <h4 className="font-semibold mb-2">Co-Scholastic Areas</h4>
//                   <table className="w-full border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">Activity</th>
//                         <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Work Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           A
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Art Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           B
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Health & Physical Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           A
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="mb-6">
//                   <div className="mb-4">
//                     <h4 className="font-semibold mb-1">Discipline</h4>
//                     <p>Grade: A</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                     <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Principal's Signature</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ReportCard;

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";

// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//     onAfterPrint: () => alert("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const getResult = async () => {
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       const updatedSelectedExams = isExamSelected
//         ? prevSelected.filter((id) => id !== exam._id)
//         : [...prevSelected, exam._id];

//       const updatedExamNames = examData
//         .filter((ex) => updatedSelectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//       setExamName(updatedExamNames);

//       // Filter and collect all selected exam results
//       const allSelectedResults = marks.filter((mark) =>
//         updatedSelectedExams.includes(mark.examId)
//       );

//       // Combine results from all selected terms
//       const combinedResults = {
//         marks: allSelectedResults.reduce((acc, curr) => {
//           curr.marks.forEach((mark) => {
//             const existingMark = acc.find(
//               (m) => m.subjectName === mark.subjectName
//             );
//             if (!existingMark) {
//               acc.push({
//                 ...mark,
//                 examResults: [
//                   {
//                     examId: curr.examId,
//                     marks: mark.marks,
//                     totalMarks: mark.totalMarks,
//                   },
//                 ],
//               });
//             } else {
//               existingMark.examResults = [
//                 ...existingMark.examResults,
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ];
//             }
//           });
//           return acc;
//         }, []),
//       };

//       setExamResults(combinedResults);
//       return updatedSelectedExams;
//     });
//   };

//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto">

//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white px-2 py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex">
//        <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//           <select
//             className=" p-2 border rounded"
//             onChange={(e) => {
//               const selected = allStudents.find(
//                 (student) => student._id === e.target.value
//               );
//               setSelectedStudent(selected);
//             }}
//           >
//             <option value="">Select a student</option>
//             {allStudents.map((student) => (
//               <option key={student._id} value={student._id}>
//                 {student.fullName} - Class {student.class} {student.section}{" "}
//                 (Roll No: {student.rollNo})
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//           <form className=" flex gap-4 items-center justify-center border-2 p-2 ">
//             {examData.map((exam) => (
//               <div key={exam._id} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id={exam._id}
//                   value={exam._id}
//                   checked={selectedExams.includes(exam._id)}
//                   onChange={() => handleCheckboxChange(exam)}
//                   className="mr-2"
//                 />
//                 <label htmlFor={exam._id}>{exam.name}</label>
//               </div>
//             ))}
//           </form>
//         </div>
//        </div>
//       </div>

//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
//               <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                 {/* Header Section */}
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                     <img
//                       src={schoolImage}
//                       alt="School Logo"
//                       className="w-full object-contain"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <h1 className="text-red-600 font-bold text-xl">
//                       R.K.S.V.M. INTER COLLEGE
//                     </h1>
//                     <p className="text-blue-600 text-sm">
//                       Makanpur Road, Nyay Khand-1st Indirapuram Gzb
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       U-DISE CODE 9100108110
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       SCHOOL AFFILIATION NO G.J.H-576
//                     </p>
//                     <p className="text-pink-500 text-lg font-bold mt-2">
//                       PROGRESS REPORT 2023-24
//                     </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 ">
//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Student's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.fullName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Father's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.fatherName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Mother's Name :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.motherName || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Class :</td>
//                           <td>{selectedStudent?.class || "N/A"}-{selectedStudent?.section || ""}</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Medium :</td>
//                           <td>Hindi</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">Roll No. :</td>
//                           <td className="whitespace-nowrap">{selectedStudent?.rollNo || "N/A"}</td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1">DOB :</td>
//                           {/* <td>{selectedStudent?.dateOfBirth || "N/A"}</td> */}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-end">
//                     <img
//                       src={selectedStudent?.image?.url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"}
//                       alt="Student"
//                       className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">SUBJECTS</th>
//                       {examName.map((name) => (
//                         <th key={name} className="border border-gray-300 p-2">
//                           {name}
//                         </th>
//                       ))}
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                       <th className="border border-gray-300 p-2">%</th>
//                       <th className="border border-gray-300 p-2">GRADE</th>
//                     </tr>
//                   </thead>
//                  { console.log("examResults",examResults)}
//                   <tbody>
//                     {examResults?.marks?.map((subject, index) => {
//                       const totalMarks = subject.examResults?.reduce(
//                         (sum, result) => sum + (result.marks || 0),
//                         0
//                       );
//                       const totalPossible = subject.examResults?.reduce(
//                         (sum, result) => sum + (result.totalMarks || 0),
//                         0
//                       );
//                       const percentage =
//                         totalPossible > 0
//                           ? (totalMarks / totalPossible) * 100
//                           : 0;

//                       return (
//                         <tr
//                           key={index}
//                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                         >
//                           <td className="border border-gray-300 p-2">
//                             {subject.subjectName}
//                           </td>
//                           {examName.map((name) => {
//                             const examResult = subject.examResults?.find(
//                               (result) =>
//                                 examData.find((exam) => exam.name === name)
//                                   ?._id === result.examId
//                             );
//                             return (
//                               <td
//                                 key={name}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult
//                                   ? `${examResult.marks}/${examResult.totalMarks}`
//                                   : "-/-"}
//                               </td>
//                             );
//                           })}
//                           <td className="border border-gray-300 p-2 text-center">
//                             {totalMarks}/{totalPossible}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {percentage.toFixed(2)}%
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {calculateGrade(percentage)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {/* Co-Scholastic Areas */}
//                 <div className="mb-6">
//                   <h4 className="font-semibold mb-2">Co-Scholastic Areas</h4>
//                   <table className="w-full border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">Activity</th>
//                         <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Work Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           A
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Art Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           B
//                         </td>
//                       </tr>
//                       <tr>
//                         <td className="border border-gray-300 p-2">
//                           Health & Physical Education
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           A
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="mb-6">
//                   <div className="mb-4">
//                     <h4 className="font-semibold mb-1">Discipline</h4>
//                     <p>Grade: A</p>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                     <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Principal's Signature</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ReportCard;

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// const ReportCard = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${"fullName"},Admission form`,
//     onAfterPrint: () => alert("Downloaded"),
//   });
//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   const authToken = Cookies.get("token");
//   const [marks, setMarks] = useState([]);
//   const getResult = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   };
//   useEffect(() => {
//     getResult();
//   }, []);

//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       const updatedSelectedExams = isExamSelected
//         ? prevSelected.filter((id) => id !== exam._id) // Remove if unchecked
//         : [...prevSelected, exam._id]; // Add if checked

//       // Update exam names
//       const updatedExamNames = examData
//         .filter((ex) => updatedSelectedExams.includes(ex._id))
//         .map((ex) => ex.name);
//       setExamName(updatedExamNames);

//       // Filter results dynamically
//       const filteredResults = marks.filter((mark) =>
//         updatedSelectedExams.includes(mark.examId)
//       );

//       console.log("Filtered Results:", filteredResults); // Debugging
//       if (filteredResults.length > 0) {
//         setExamResults(filteredResults[0]);
//       } else {
//         setExamResults([]); // Default empty state
//       }

//       return updatedSelectedExams;
//     });
//   };

//   // const handleCheckboxChange = (exam) => {

//   //   setExamName((preV) => [...preV, exam?.name]);
//   //   setSelectedExams((prevSelected) => {
//   //     const updatedSelectedExams = prevSelected.includes(exam._id)
//   //       ? prevSelected.filter((id) => id !== exam._id)
//   //       : [...prevSelected, exam._id];

//   //     const filteredResults = marks?.filter((mark) =>
//   //       updatedSelectedExams.includes(mark.examId)
//   //     );
//   //     setExamResults(filteredResults[0]);
//   //     return updatedSelectedExams;
//   //   });
//   // };
//   const studentsData = [
//     {
//       student: {
//         name: "John Doe",
//         rollNo: "12345",
//         class: "10",
//         section: "A",
//         motherName: "Jane Doe",
//         fatherName: "John Smith",
//         dateOfBirth: "2006-05-15",
//         admissionNo: "A12345",
//       },
//       subjects: [
//         {
//           name: "Mathematics",
//           marks: [
//             { examType: "Mid-Term", marks: 80, outOf: 100 },
//             { examType: "Final", marks: 85, outOf: 100 },
//             { examType: "Pre-Board", marks: 90, outOf: 100 },
//           ],
//           // totalMarks: 0,
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//         {
//           name: "Science",
//           marks: [
//             { examType: "Mid-Term", marks: 75, outOf: 100 },
//             { examType: "Final", marks: 78, outOf: 100 },
//             { examType: "Pre-Board", marks: 85, outOf: 100 },
//           ],
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//         {
//           name: "English",
//           marks: [
//             { examType: "Mid-Term", marks: 70, outOf: 100 },
//             { examType: "Final", marks: 72, outOf: 100 },
//             { examType: "Pre-Board", marks: 80, outOf: 100 },
//           ],
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//       ],
//     },
//   ];

//   return (
//     <>
//       <div className="mb-4  mx-auto">
//         <div>
//           <h3>Select Exams</h3>
//           {/* <form>

//             {examData.map((exam) => (
//               <div key={exam._id}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     value={exam._id}
//                     checked={selectedExams.includes(exam._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                   />
//                   {exam.name}
//                 </label>
//               </div>
//             ))}
//           </form> */}
//           <form>
//   {examData.map((exam) => (
//     <div key={exam._id} className="mb-2">
//       <label>
//         <input
//           type="checkbox"
//           value={exam._id}
//           checked={selectedExams.includes(exam._id)}
//           onChange={() => handleCheckboxChange(exam)}
//           className="mr-2"
//         />
//         {exam.name}
//       </label>
//     </div>
//   ))}
// </form>

//         </div>
//         <div
//           className="rounded-tl-lg border flex justify-between rounded-tr-lg text-white px-2 text-[12px] lg:text-lg"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, ${"#8d8b8b"})`,
//           }}
//         >
//           <p>Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-[16px] lg:text-[25px] text-white cursor-pointer"
//           />
//         </div>

//       </div>

//       {studentsData.map((studentData, index) => {
//         const { student, subjects } = studentData;

//         return (
//           <div className="w-full flex justify-center">
//             <div className="a4">
//               <div className="content  border-2  m-1">
//                 <div ref={componentPDF}className="p-12 "
//                   // ye A4 size hai
//                 >
//                   <div key={index}
//                     className="bg-white   border-2 rounded-md p-6  max-w-4xl mx-auto mb-6"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="h-[70px] w-[70px]">
//                         <img
//                           src={schoolImage}
//                           alt="School Logo"
//                           className=" w-full object-contain"
//                         />
//                       </div>
//                       <div className="text-center">
//                         <h1 className="text-red-600 font-bold text-xl">
//                           {"R.K.S.V.M. INTER COLLEGE"}
//                         </h1>
//                         <p className="text-blue-600 text-sm">
//                           Makanpur Road, Nyay Khand-1st Indirapuram Gzb
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                           U-DISE CODE 9100108110
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                           SCHOOL AFFILIATION NO G.J.H-576
//                         </p>
//                         <p className="text-center text-lg font-bold text-pink-500 mt-2">
//                           PROGRESS REPORT 2023-24
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-black text-sm"></p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-4 mb-1 text-sm  border p-2">
//                       <table className=" text-left text-sm">
//                         <tbody>
//                           <tr className="p-2">
//                             <td className="font-semibold py-1">
//                               Student's Name:
//                             </td>
//                             <td className="py-1">
//                               Anand kumar
//                               {/* {studentData.fullName?.toUpperCase()} */}
//                               {selectedStudent?.fullName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               Father's Name :
//                             </td>
//                             <td className="py-1">
//                               {/* Anand Jaiswal */}
//                               {selectedStudent?.fatherName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               Mother's Name:
//                             </td>
//                             <td className="py-1">
//                               {selectedStudent?.motherName || "N/A"}

//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">Class:</td>
//                             <td className="py-1">
//                               {selectedStudent?.class || "N/A"}-
//                               {selectedStudent?.section || ""}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                       <table className=" text-left text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1">Medium:</td>
//                             <td className="py-1">
//                               Hindi
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">Roll No.:</td>
//                             <td className="py-1">123456</td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">DOB:</td>
//                             <td className="py-1">17-05-1996</td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               DOB (in Words):
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                       <div className=" flex justify-end  pr-1 pt-1">
//                         {selectedStudent?.image?.url ? (
//                           <img
//                             className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                             src={selectedStudent.image.url}
//                             alt="Student"
//                           />
//                         ) : (
//                           <img
//                             className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                             src="https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                             alt="No Image Available"
//                           />
//                         )}
//                       </div>
//                     </div>

//                     <table className="w-full mb-4 text-sm border-collapse border border-gray-300">
//                       <thead>
//                         <tr className="bg-gray-200">
//                           <th className="border border-gray-300 p-2">
//                             SUBJECTS
//                           </th>

//                           {examName.map((name) => (
//                             <th
//                               key={name}
//                               className="border border-gray-300 p-2"
//                             >
//                               {name}
//                             </th>
//                           ))}
//                           <th className="border border-gray-300 p-2">TOTAL</th>
//                           <th className="border border-gray-300 p-2">%</th>
//                           <th className="border border-gray-300 p-2">GRADE</th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {console.log(
//                           "examResultsexamResultsexamResults",
//                           examResults?.marks
//                         )}
//                         {examResults?.marks?.map((subject, index) => (
//                           <tr
//                             key={index}
//                             className={index % 2 === 0 ? "bg-gray-100" : ""}
//                           >
//                             <td className="border border-gray-300 p-2">
//                               {subject.subjectName}
//                             </td>

//                             <td className="border border-gray-300 p-2 text-center">
//                               {subject?.marks}/{subject?.totalMarks}
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {/* {subject?.percentage.toFixed(2)}% */}
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {subject?.grade}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>

//                     <div className="mb-4 text-sm">
//                       <p>
//                         <strong>Total Marks:</strong>
//                         {/* {totalMarks} / {totalOutOf} */}
//                       </p>
//                       <p>
//                         {/* <strong>Percentage:</strong> {percentage.toFixed(2)}% */}
//                       </p>
//                       <p>
//                         {/* <strong>Overall Grade:</strong> {overallGrade} */}
//                       </p>
//                     </div>

//                     <div className="mb-4 text-sm">
//                       <h4 className="font-semibold mb-1">
//                         Co-Scholastic Areas
//                       </h4>
//                       <table className="w-full border-collapse border border-gray-300">
//                         <thead>
//                           <tr className="bg-gray-200">
//                             <th className="border border-gray-300 p-2">
//                               Activity
//                             </th>
//                             <th className="border border-gray-300 p-2">
//                               Grade
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Work Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               A
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Art Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               B
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Health & Physical Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               A
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="text-sm">
//                       <h4 className="font-semibold mb-1">Discipline</h4>
//                       <p>Grade: A</p>
//                     </div>

//                     <div className="mt-4 text-sm">
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                     </div>

//                     <div className="mt-6 flex justify-between text-sm">
//                       <div>Class Teacher's Signature</div>
//                       <div>Principal's Signature</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// };

// export default ReportCard;

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@mui/material";
// import DownloadIcon from "@mui/icons-material/Download";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from 'axios';
// import Cookies from 'js-cookie';
// const ReportCard = () => {
//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${"fullName"},Admission form`,
//     onAfterPrint: () => alert("Downloaded"),
//   });

//   const authToken = Cookies.get('token');
//   const [marks, setMarks] = useState([]);
//   const getResult = async () => {
//     try {
//       let response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );
//       setMarks(response.data.exams); // Save exams data to state
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//     }
//   };
// console.log("marks",marks)
//   useEffect(() => {
//     getResult();
//   }, []);

//   const studentsData = [
//     {
//       student: {
//         name: "John Doe",
//         rollNo: "12345",
//         class: "10",
//         section: "A",
//         motherName: "Jane Doe",
//         fatherName: "John Smith",
//         dateOfBirth: "2006-05-15",
//         admissionNo: "A12345",
//       },
//       subjects: [
//         {
//           name: "Mathematics",
//           marks: [
//             { examType: "Mid-Term", marks: 80, outOf: 100 },
//             { examType: "Final", marks: 85, outOf: 100 },
//             { examType: "Pre-Board", marks: 90, outOf: 100 },
//           ],
//           totalMarks: 0,
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//         {
//           name: "Science",
//           marks: [
//             { examType: "Mid-Term", marks: 75, outOf: 100 },
//             { examType: "Final", marks: 78, outOf: 100 },
//             { examType: "Pre-Board", marks: 85, outOf: 100 },
//           ],
//           totalMarks: 0,
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//         {
//           name: "English",
//           marks: [
//             { examType: "Mid-Term", marks: 70, outOf: 100 },
//             { examType: "Final", marks: 72, outOf: 100 },
//             { examType: "Pre-Board", marks: 80, outOf: 100 },
//           ],
//           totalMarks: 0,
//           totalOutOf: 0,
//           percentage: 0,
//           grade: "",
//         },
//       ],
//     },

//   ];

//   const examTypes = ["Mid-Term", "Final", "Pre-Board"];

//   const [selectedExams, setSelectedExams] = useState(examTypes);

//   // Handle checkbox change
//   const handleCheckboxChange = (examType) => {
//     setSelectedExams((prevSelectedExams) =>
//       prevSelectedExams.includes(examType)
//         ? prevSelectedExams.filter((type) => type !== examType)
//         : [...prevSelectedExams, examType]
//     );
//   };

//   // Calculate dynamic total marks, percentage, and grade for a subject
//   const calculateSubjectData = (subject) => {
//     let totalMarks = 0;
//     let totalOutOf = 0;
//     subject.marks.forEach((mark) => {
//       if (selectedExams.includes(mark.examType)) {
//         totalMarks += mark.marks;
//         totalOutOf += mark.outOf;
//       }
//     });
//     const percentage = totalOutOf > 0 ? (totalMarks / totalOutOf) * 100 : 0;
//     let grade = "";

//     if (percentage >= 90) grade = "A1";
//     else if (percentage >= 80) grade = "A2";
//     else if (percentage >= 70) grade = "B1";
//     else if (percentage >= 60) grade = "B2";
//     else if (percentage >= 50) grade = "C1";
//     else if (percentage >= 40) grade = "C2";
//     else grade = "D";

//     return { totalMarks, totalOutOf, percentage, grade };
//   };

//   // Calculate overall data for each student
//   const calculateOverallData = (subjects) => {
//     let totalMarks = 0;
//     let totalOutOf = 0;

//     subjects.forEach((subject) => {
//       const { totalMarks: subjectTotalMarks, totalOutOf: subjectTotalOutOf } =
//         calculateSubjectData(subject);
//       totalMarks += subjectTotalMarks;
//       totalOutOf += subjectTotalOutOf;
//     });

//     const percentage = totalOutOf > 0 ? (totalMarks / totalOutOf) * 100 : 0;
//     let overallGrade = "";

//     if (percentage >= 90) overallGrade = "A1";
//     else if (percentage >= 80) overallGrade = "A2";
//     else if (percentage >= 70) overallGrade = "B1";
//     else if (percentage >= 60) overallGrade = "B2";
//     else if (percentage >= 50) overallGrade = "C1";
//     else if (percentage >= 40) overallGrade = "C2";
//     else overallGrade = "D";

//     return { totalMarks, totalOutOf, percentage, overallGrade };
//   };

//   // Update subjects data dynamically
//   const updateSubjectsData = (subjects) => {
//     subjects.forEach((subject) => {
//       const { totalMarks, totalOutOf, percentage, grade } =
//         calculateSubjectData(subject);
//       subject.totalMarks = totalMarks;
//       subject.totalOutOf = totalOutOf;
//       subject.percentage = percentage;
//       subject.grade = grade;
//     });
//   };

//   return (
//     <>
//       <div className="mb-4  mx-auto">
//         <div
//           className="rounded-tl-lg border flex justify-between rounded-tr-lg text-white px-2 text-[12px] lg:text-lg"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, ${"#8d8b8b"})`,
//           }}
//         >
//           <p>Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-[16px] lg:text-[25px] text-white cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex space-x-2">
//           {examTypes.map((examType) => (
//             <div key={examType} className="space-x-2">
//               <div>
//                 <input
//                   type="checkbox"
//                   checked={selectedExams.includes(examType)}
//                   onChange={() => handleCheckboxChange(examType)}
//                   id={examType}
//                   className="h-4 w-4"
//                 />
//                 <label htmlFor={examType} className="text-sm">
//                   {examType}
//                 </label>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {studentsData.map((studentData, index) => {
//         const { student, subjects } = studentData;

//         // Update subjects data for each student
//         updateSubjectsData(subjects);

//         const { totalMarks, totalOutOf, percentage, overallGrade } =
//           calculateOverallData(subjects);

//         return (
//           <div className="w-full flex justify-center">
//             <div className="a4">
//               <div className="content  border-2  m-1">
//                 <div
//                   ref={componentPDF}
//                   className="p-12 "
//                   // ye A4 size hai
//                 >
//                   <div
//                     key={index}
//                     className="bg-white   border-2 rounded-md p-6  max-w-4xl mx-auto mb-6"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="h-[70px] w-[70px]">
//                         <img
//                           src={schoolImage}
//                           alt="School Logo"
//                           className=" w-full object-contain"
//                         />
//                       </div>
//                       <div className="text-center">
//                         <h1 className="text-red-600 font-bold text-xl">
//                           {"R.K.S.V.M. INTER COLLEGE"}
//                         </h1>
//                         <p className="text-blue-600 text-sm">
//                           Makanpur Road, Nyay Khand-1st Indirapuram Gzb
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                           U-DISE CODE 9100108110
//                         </p>
//                         <p className="text-green-600 text-sm font-bold">
//                           SCHOOL AFFILIATION NO G.J.H-576
//                         </p>
//                         <p className="text-center text-lg font-bold text-pink-500 mt-2">
//                           PROGRESS REPORT 2023-24
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-black text-sm"></p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-4 mb-1 text-sm  border p-2">
//                       <table className=" text-left text-sm">
//                         <tbody>
//                           <tr className="p-2">
//                             <td className="font-semibold py-1">
//                               Student's Name:
//                             </td>
//                             <td className="py-1">
//                               Anand kumar
//                               {/* {studentData.fullName?.toUpperCase()} */}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               Father's Name :
//                             </td>
//                             <td className="py-1">Anand Jaiswal</td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               Mother's Name:
//                             </td>
//                             <td className="py-1">
//                               Mother
//                               {/* {studentData.motherName?.toUpperCase()} */}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">Class:</td>
//                             <td className="py-1">
//                               V-A
//                               {/* {studentData.class}-{studentData.section} */}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                       <table className=" text-left text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1">Medium:</td>
//                             <td className="py-1">
//                               Hindi
//                               {/* {studentData.medium} */}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">Roll No.:</td>
//                             <td className="py-1">
//                               123456
//                               {/* {studentData.scholarNumber} */}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">DOB:</td>
//                             <td className="py-1">
//                               17-05-1996
//                               {/* {new Date(
//                                   studentData.dateOfBirth
//                                 ).toLocaleDateString("en-US")} */}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">
//                               DOB (in Words):
//                             </td>
//                             {/* <td className="py-1">{convertDateToWords(studentData.dateOfBirth)}</td> */}
//                           </tr>
//                         </tbody>
//                       </table>
//                       {/* </div> */}
//                       <div className=" flex justify-end  pr-1 pt-1">
//                         {studentData.image && studentData.image.url ? (
//                           <img
//                             className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                             src={studentData.image.url}
//                             alt="Student"
//                           />
//                         ) : (
//                           <img
//                             className="w-24 h-24 object-cover border border-gray-300 rounded-md"
//                             src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
//                             alt="No Image Available"
//                           />
//                         )}
//                       </div>
//                     </div>

//                     <table className="w-full mb-4 text-sm border-collapse border border-gray-300">
//                       <thead>
//                         <tr className="bg-gray-200">
//                           <th className="border border-gray-300 p-2">
//                             SUBJECTS
//                           </th>
//                           {selectedExams.map((examType) => (
//                             <th
//                               key={examType}
//                               className="border border-gray-300 p-2"
//                             >
//                               {examType}
//                             </th>
//                           ))}
//                           <th className="border border-gray-300 p-2">TOTAL</th>
//                           <th className="border border-gray-300 p-2">%</th>
//                           <th className="border border-gray-300 p-2">GRADE</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {subjects.map((subject, index) => (
//                           <tr
//                             key={index}
//                             className={index % 2 === 0 ? "bg-gray-100" : ""}
//                           >
//                             <td className="border border-gray-300 p-2">
//                               {subject.name}
//                             </td>
//                             {selectedExams.map((examType) => {
//                               const mark = subject.marks.find(
//                                 (m) => m.examType === examType
//                               );
//                               return (
//                                 <td
//                                   key={examType}
//                                   className="border border-gray-300 p-2 text-center"
//                                 >
//                                   {mark ? `${mark.marks}/${mark.outOf}` : "-"}
//                                 </td>
//                               );
//                             })}
//                             <td className="border border-gray-300 p-2 text-center">
//                               {subject.totalMarks}/{subject.totalOutOf}
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {subject.percentage.toFixed(2)}%
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {subject.grade}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>

//                     <div className="mb-4 text-sm">
//                       <p>
//                         <strong>Total Marks:</strong> {totalMarks} /{" "}
//                         {totalOutOf}
//                       </p>
//                       <p>
//                         <strong>Percentage:</strong> {percentage.toFixed(2)}%
//                       </p>
//                       <p>
//                         <strong>Overall Grade:</strong> {overallGrade}
//                       </p>
//                     </div>

//                     <div className="mb-4 text-sm">
//                       <h4 className="font-semibold mb-1">
//                         Co-Scholastic Areas
//                       </h4>
//                       <table className="w-full border-collapse border border-gray-300">
//                         <thead>
//                           <tr className="bg-gray-200">
//                             <th className="border border-gray-300 p-2">
//                               Activity
//                             </th>
//                             <th className="border border-gray-300 p-2">
//                               Grade
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Work Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               A
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Art Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               B
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="border border-gray-300 p-2">
//                               Health & Physical Education
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               A
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="text-sm">
//                       <h4 className="font-semibold mb-1">Discipline</h4>
//                       <p>Grade: A</p>
//                     </div>

//                     <div className="mt-4 text-sm">
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                     </div>

//                     <div className="mt-6 flex justify-between text-sm">
//                       <div>Class Teacher's Signature</div>
//                       <div>Principal's Signature</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// };

// export default ReportCard;
