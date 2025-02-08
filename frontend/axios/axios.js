import axios from "axios";
import Router from 'next/router'; 

// Set the baseURL based on the environment
const baseURL = process.env.NEXT_PUBLIC_ENV === 'development'
  ? "http://0.0.0.0:8000/api/"
  : `${process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL ? process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL : ''}/api/`;

// Handle undefined production baseURL with a fallback or error
if (!baseURL.includes('api')) {

  console.error("Base URL is not defined properly. Please check your environment variables.");
}

const axiosInstance = axios.create({
  baseURL: baseURL
});


axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



  
//axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response) {
//       if (error.response.status === 401) {
//         // Redirect to the login page or display a message
//         Router.push('/login'); // Change this to your login route
//       } 
//       else if (!error.response.status.toString().startsWith('2')) {
//         Router.push('/404');
//       }
//     } else if (error.request) {
//       Router.push('/404');
//     } else {
//       Router.push('/404');
//     }

//     return Promise.reject(error); 
//   }
// );


export default axiosInstance;