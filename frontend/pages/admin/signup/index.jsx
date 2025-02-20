import { CircleAlert } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSignupComponent from "@/components/signup-form";
import axios from "axios";

const AdminSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [passwordStrengthColor, setPasswordStrengthColor] =
    useState("text-gray-500");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [passwordMatchColor, setPasswordMatchColor] = useState("text-gray-500");
  const [phoneNumberMessage, setPhoneNumberMessage] = useState("");
  const [phoneNumberMatchColor, setphoneNumberMatchColor] =
    useState("text-gray-500");

  const route = useRouter();


  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 30;
    const upperCaseValid = /[A-Z]/.test(password);
    const lowerCaseValid = /[a-z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialCharValid = /[!@#$%^&*()+\-_=<>?]/.test(password);

    if (
      lengthValid &&
      upperCaseValid &&
      lowerCaseValid &&
      numberValid &&
      specialCharValid
    ) {
      setPasswordStrengthColor("text-green-500");
      setPasswordValidationMessage("Strong password.");
    } else {
      setPasswordStrengthColor("text-red-500");
      setPasswordValidationMessage(
        "Password must be 8-30 characters long and include upper and lower case letters, a number, and a special character."
      );
    }
  };

  const validatePasswordMatch = (confirmPassword) => {
    if (confirmPassword === password) {
      setPasswordMatchColor("text-green-500");
      setPasswordMatchMessage("Passwords match.");
    } else {
      setPasswordMatchColor("text-red-500");
      setPasswordMatchMessage("Passwords do not match.");
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/[\s+]/g, "");
    const phoneRegex = /^[0-9]{10,15}$/;
    if (phoneRegex.test(cleaned)) {
      setPhoneNumberMessage("Valid Phone number.");
      setphoneNumberMatchColor("text-green-500");
    } else {
      setPhoneNumberMessage("Please enter a valid phone number!");
      setphoneNumberMatchColor("text-red-500");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);
    setErrorMessage("");

    const formattedPhoneNumber = phoneNumber.replace(/[\s]/g, "");
    const API_URL_SIGNUP = "http://127.0.0.1:8000/api/register-admin/";
    const API_URL_LOGIN = "http://127.0.0.1:8000/api/login-admin/";

    const adminSignUpFormData = {
      email: email,
      phone: formattedPhoneNumber,
      name: `${firstName} ${lastName}`,
      password_hash: password,
    };

    try {
      const response = await axios.post(API_URL_SIGNUP, adminSignUpFormData, {
        headers: {
          "Content-Type": "application/json",
        }
      });


      if (response.status == 201) {
        const loginData = {
          email: adminSignUpFormData.email,
          password_hash: adminSignUpFormData.password_hash
        };

        try {
          const login_response = await axios.post(API_URL_LOGIN, loginData, {
            headers: {
              "Content-Type": "application/json",
            }
          });
          localStorage.setItem("access_token", login_response.data.access);
          route.push("/admin/dashboard");
        } catch(error) {
          setErrorMessage("An error occured. Please try again.");
          console.log(error);
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.log(error);
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <AdminSignupComponent
      props={{
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        phoneNumber,
        setPhoneNumber,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        isSigningUp,
        setIsSigningUp,
        errorMessage,
        setErrorMessage,
        showTooltip,
        setShowTooltip,
        passwordValidationMessage,
        passwordStrengthColor,
        passwordMatchMessage,
        passwordMatchColor,
        validatePassword,
        validatePasswordMatch,
        handleSignup,
        validatePhoneNumber,
        phoneNumberMessage,
        phoneNumberMatchColor,
      }}
    />
  );
};

export default AdminSignup;
