import React, { useState } from 'react';

const GenerateReport = () => {
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [reportData, setReportData] = useState([]);

  // Static data for exams and students
  const exams = [
    { id: '1', name: 'Mid-Term Exam' },
    { id: '2', name: 'Final Exam' },
  ];

  const students = [
    { id: '1', name: 'John Doe', rollNo: '101', class: '10', section: 'A' },
    { id: '2', name: 'Jane Smith', rollNo: '102', class: '10', section: 'A' },
    { id: '3', name: 'Bob Brown', rollNo: '103', class: '10', section: 'B' },
  ];

  const filterStudents = () => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.includes(searchTerm)
      );
    }
    if (classFilter) {
      filtered = filtered.filter((student) => student.class === classFilter);
    }
    if (sectionFilter) {
      filtered = filtered.filter((student) => student.section === sectionFilter);
    }
    return filtered;
  };

  const handleExamSelection = (examId) => {
    setSelectedExams((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    const filteredStudents = filterStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();

    const reports = selectedStudents.map((studentId) => {
      const student = students.find((s) => s.id === studentId);
      return {
        student,
        exams: selectedExams.map((examId) => exams.find((e) => e.id === examId)),
      };
    });

    setReportData(reports);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <form onSubmit={handleGenerateReport} className="space-y-4 bg-white shadow p-4 rounded-md">
        <h2 className="text-2xl font-bold text-gray-700">Generate Report</h2>

        {/* Exam Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Select Exams</h3>
          <div className="mt-2 space-y-2">
            {exams.map((exam) => (
              <label key={exam.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={exam.id}
                  checked={selectedExams.includes(exam.id)}
                  onChange={() => handleExamSelection(exam.id)}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <span>{exam.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Search Students</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or roll number"
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Class</label>
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Enter class"
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Section</label>
            <input
              type="text"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              placeholder="Enter section"
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>
        </div>

        {/* Student Selection */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={
                selectedStudents.length === filterStudents().length &&
                filterStudents().length > 0
              }
              onChange={handleSelectAllStudents}
              className="h-4 w-4 text-blue-500 border-gray-300 rounded"
            />
            <span>Select All Students</span>
          </label>
          <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {filterStudents().map((student) => (
              <label key={student.id} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  value={student.id}
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentSelection(student.id)}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <span>
                  {student.name} - Roll No: {student.rollNo} - Class: {student.class}{' '}
                  {student.section}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Generate Report
        </button>
      </form>

      {/* Report Cards */}
      {reportData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Generated Reports</h3>
          {reportData.map((data, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-md p-4 border border-gray-200"
            >
              <h4 className="text-lg font-bold text-gray-800">
                {data.student.name} (Roll No: {data.student.rollNo})
              </h4>
              <ul className="mt-2 space-y-1">
                {data.exams.map((exam) => (
                  <li key={exam.id} className="text-gray-700">
                    Exam: {exam.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateReport;




// import React, { useState, useEffect } from 'react';
// import { api } from '../api/api';
// import ReportCard from './ReportCard';
// import { Button, Input, Select, Checkbox } from '@/components/ui';

// export default function GenerateReport() {
//   const [exams, setExams] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [reportData, setReportData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [classFilter, setClassFilter] = useState('');
//   const [sectionFilter, setSectionFilter] = useState('');

//   useEffect(() => {
//     fetchExams();
//     fetchStudents();
//   }, []);

//   useEffect(() => {
//     filterStudents();
//   }, [students, searchTerm, classFilter, sectionFilter]);

//   const fetchExams = async () => {
//     try {
//       const response = await api.getExams();
//       setExams(response.data);
//     } catch (error) {
//       console.error('Error fetching exams:', error);
//     }
//   };

//   const fetchStudents = async () => {
//     try {
//       const response = await api.getStudents();
//       setStudents(response.data);
//     } catch (error) {
//       console.error('Error fetching students:', error);
//     }
//   };

//   const filterStudents = () => {
//     let filtered = students;
//     if (searchTerm) {
//       filtered = filtered.filter(student => 
//         student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         student.rollNo.includes(searchTerm)
//       );
//     }
//     if (classFilter) {
//       filtered = filtered.filter(student => student.class === classFilter);
//     }
//     if (sectionFilter) {
//       filtered = filtered.filter(student => student.section === sectionFilter);
//     }
//     setFilteredStudents(filtered);
//   };

//   const handleExamSelection = (examId: string) => {
//     setSelectedExams(prev => 
//       prev.includes(examId)
//         ? prev.filter(id => id !== examId)
//         : [...prev, examId]
//     );
//   };

//   const handleStudentSelection = (studentId: string) => {
//     setSelectedStudents(prev => 
//       prev.includes(studentId)
//         ? prev.filter(id => id !== studentId)
//         : [...prev, studentId]
//     );
//   };

//   const handleSelectAllStudents = () => {
//     if (selectedStudents.length === filteredStudents.length) {
//       setSelectedStudents([]);
//     } else {
//       setSelectedStudents(filteredStudents.map(student => student.id));
//     }
//   };

//   const calculateGrade = (percentage: number): string => {
//     if (percentage >= 91) return 'A1';
//     if (percentage >= 81) return 'A2';
//     if (percentage >= 71) return 'B1';
//     if (percentage >= 61) return 'B2';
//     if (percentage >= 51) return 'C1';
//     if (percentage >= 41) return 'C2';
//     if (percentage >= 33) return 'D';
//     return 'E';
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const reports = await Promise.all(
//         selectedStudents.map(async (studentId) => {
//           const student = students.find(s => s.id === studentId);
//           if (!student) throw new Error('Student not found');

//           const marksData = await Promise.all(
//             selectedExams.map(examId => api.getMarks(studentId, examId))
//           );

//           const flattenedMarks = marksData.flatMap(response => response.data);

//           const subjectsWithMarks = flattenedMarks.reduce((acc, mark) => {
//             const subject = acc.find(s => s.subjectId === mark.subject.id);
//             if (subject) {
//               subject.marks.push({
//                 examType: mark.exam.examType,
//                 marks: mark.marks,
//                 outOf: mark.subject.totalMarks,
//               });
//             } else {
//               acc.push({
//                 subjectId: mark.subject.id,
//                 subjectName: mark.subject.name,
//                 marks: [{
//                   examType: mark.exam.examType,
//                   marks: mark.marks,
//                   outOf: mark.subject.totalMarks,
//                 }],
//               });
//             }
//             return acc;
//           }, []);

//           const processedSubjects = subjectsWithMarks.map(subject => {
//             const totalMarks = subject.marks.reduce((sum, mark) => sum + mark.marks, 0);
//             const totalOutOf = subject.marks.reduce((sum, mark) => sum + mark.outOf, 0);
//             const percentage = (totalMarks / totalOutOf) * 100;

//             return {
//               name: subject.subjectName,
//               marks: subject.marks,
//               totalMarks,
//               totalOutOf,
//               percentage,
//               grade: calculateGrade(percentage),
//             };
//           });

//           const overallTotalMarks = processedSubjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
//           const overallTotalOutOf = processedSubjects.reduce((sum, subject) => sum + subject.totalOutOf, 0);
//           const overallPercentage = (overallTotalMarks / overallTotalOutOf) * 100;

//           return {
//             student,
//             subjects: processedSubjects,
//             totalMarks: overallTotalMarks,
//             totalOutOf: overallTotalOutOf,
//             percentage: overallPercentage,
//             overallGrade: calculateGrade(overallPercentage),
//             examTypes: selectedExams.map(examId => exams.find(e => e.id === examId)?.examType).filter(Boolean),
//           };
//         })
//       );

//       setReportData(reports);
//     } catch (error) {
//       console.error('Error generating report:', error);
//       alert('Failed to generate report. Please try again.');
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Select Exams</label>
//           <div className="mt-2 space-y-2">
//             {exams.map(exam => (
//               <Checkbox
//                 key={exam.id}
//                 label={exam.name}
//                 checked={selectedExams.includes(exam.id)}
//                 onChange={() => handleExamSelection(exam.id)}
//               />
//             ))}
//           </div>
//         </div>
//         <Input
//           label="Search Students"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search by name or roll number"
//         />
//         <div className="flex space-x-4">
//           <Input
//             label="Filter by Class"
//             value={classFilter}
//             onChange={(e) => setClassFilter(e.target.value)}
//             placeholder="Enter class"
//           />
//           <Input
//             label="Filter by Section"
//             value={sectionFilter}
//             onChange={(e) => setSectionFilter(e.target.value)}
//             placeholder="Enter section"
//           />
//         </div>
//         <div>
//           <Checkbox
//             label="Select All Students"
//             checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
//             onChange={handleSelectAllStudents}
//           />
//           <div className="mt-2 max-h-60 overflow-y-auto">
//             {filteredStudents.map(student => (
//               <Checkbox
//                 key={student.id}
//                 label={`${student.name} - Roll No: ${student.rollNo} - Class: ${student.class} ${student.section}`}
//                 checked={selectedStudents.includes(student.id)}
//                 onChange={() => handleStudentSelection(student.id)}
//               />
//             ))}
//           </div>
//         </div>
//         <Button type="submit">Generate Report</Button>
//       </form>
//       <div className="mt-8">
//         {reportData.map((data, index) => (
//           <ReportCard key={index} data={data} />
//         ))}
//       </div>
//     </div>
//   );
// }

