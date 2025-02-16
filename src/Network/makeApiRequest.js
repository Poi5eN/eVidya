

import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = 'https://eserver-i5sm.onrender.com/api/v1';
  const authToken = Cookies.get('token');
const makeApiRequest = async (url, option) => {

// const makeApiRequest = async (url, method = 'GET', data = null, headers = {}) => {
  try {
    
      const fullURL = baseURL + "/" + url;
      
      const config = {
      method: option.method,
      url: fullURL,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };


    
    if (option) {
      config.data = option.payloadData;
    }
   
    const response = await axios(config);
   console.log("network response",response)
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`API request failed with status ${response.status}`);
    }
   } catch (error) {
    // If it is a network error
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error("Network error, please check your connection.");
    }
   
    // When there is an error in the response from the server
    if (error.response) {
      const errorMessage =
        error.response.data?.message || error.message || 'An error occurred';
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || 'An error occurred');
    }
   }
   };
   
   export default makeApiRequest;
    