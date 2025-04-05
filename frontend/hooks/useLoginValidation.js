import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const useLoginValidation = async (setLoading, redirectTo) => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loginValidationCmplete, setLoginValidationComplete] = useState(false);
   const route = useRouter(); 

   const validateLogin = async (token) => {
      setLoading(true);
      try {
         const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/verify/`, {
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
         });
         if (response.data.message) {
            setIsLoggedIn(true);
         }
      } catch (error) {
         setIsLoggedIn(false);
      } finally {
         setLoginValidationComplete(true);
      }
   };

   useEffect(() => {
      debugger
      const token = localStorage.getItem("access_token");
      if (token) validateLogin(token);
      else {
         if (route.pathname != "/admin/login") {
            route.replace("/admin/login");
         }
         else setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (isLoggedIn) {
         if (route.pathname != "/admin/dashboard") {
            route.replace(redirectTo);
         } else setLoading(false);
      }
      if (!isLoggedIn && loginValidationCmplete) setLoading(false);
   }, [isLoggedIn]);
};

export default useLoginValidation;
