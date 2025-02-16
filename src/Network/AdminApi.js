


import { apiUrls } from './ApiEndpoints';
import makeApiRequest from './makeApiRequest'; // Provide the correct path

export const StudentgetRegistrations = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getRegistrations}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const LastYearStudents = async () => {

  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.AdmingetAllStudents}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const AdminGetAllClasses = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getAllClasses}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const StudentCreateRegistrations = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createRegistrations}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const StudentDeleteRegistrations = async (registrationNumber) => {
  console.log("registrationNumber",registrationNumber)
  try {
    const option = {
      method: "delete",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.deleteRegistrations}/${registrationNumber}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

