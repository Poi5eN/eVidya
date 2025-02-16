import axios from "axios";
import Cookies from "js-cookie";
const authToken = Cookies.get("token");

export const teacherApi = async (email) => {
  const tachapi = await axios.get(
    `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return tachapi;
};

export const getAllStudent = () => {
  const numberOfStudent = axios.get(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return numberOfStudent;
};
