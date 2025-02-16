import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
  } from "@/components/ui/tooltip";
  import { CircleAlert } from "lucide-react";
  import Link from "next/link";
  import Image from "next/image";
  import React, { useState, useEffect } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
//   import { doCreateStudentWithEmailAndPassword } from "@/firebase/auth";
//   import { getFirestore } from "firebase/firestore";
//   import { doc, getDoc } from "firebase/firestore"; 
//   import axiosInstance from "@/axios/axios";
  
  const AdminSignup = () => {
    const router = useRouter();
    // const db = getFirestore();
  
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const [passwordValidationMessage, setPasswordValidationMessage] = useState("");
    const [passwordStrengthColor, setPasswordStrengthColor] = useState("text-gray-500");
    const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
    const [passwordMatchColor, setPasswordMatchColor] = useState("text-gray-500");
    const [currentUser,setCurrentUser] = useState(null);
  
    const searchParams = useSearchParams();
  
  
  
//     const [emailVerificationRedirectUrl, setEmailVerificationRedirectUrl] = useState('/login');
  
  
  
// //   const sendEmailVerification = async (email) => {
// //     try {
// //       const response = await axiosInstance.post('/common/send-email-verification', {
// //         email: email,
// //         redirect_url : emailVerificationRedirectUrl
// //       });
// //       console.log('POST request successful:', response.data);
// //     } catch (error) {
// //       console.error('Error making POST request:', error);
// //     }
// //   };
  
//   const [joinForFree, setJoinForFree] = useState(true);
  
//   useEffect(() => {
//     const queryJoinForFree = searchParams.get('joinForFree');
//     if (queryJoinForFree && queryJoinForFree === true) {
//       setJoinForFree(queryJoinForFree === true);
//     } else{
//       setJoinForFree(queryJoinForFree !== true)
//     }
//   }, [searchParams]);
  
//   const [courseIdentifier, setCourseIdentifier] = useState('');
  
//   useEffect(() => {
//     const queryIdentifier = searchParams.get('courseIdentifier');
//     if (queryIdentifier) {
//         setCourseIdentifier(queryIdentifier);
//     }
//   }, [searchParams]);
  
//   useEffect(() => {
//     if (courseIdentifier && courseIdentifier !== null && courseIdentifier !== '') {
//       setEmailVerificationRedirectUrl(`/login?courseIdentifier=${courseIdentifier}`);
//     }
    
//   }, [courseIdentifier]);
  
//   useEffect(() => {
//     if (!currentUser) return;
  
//     sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  
//     const redirectTo = () => {
//       if (currentUser.user_type === 3) {
//         if (courseIdentifier) {
//           return `/email-verification/?email=${currentUser.email}&courseIdentifier=${courseIdentifier}`;
//         } else if (joinForFree === true) {
//           return `/email-verification/?email=${currentUser.email}`;
//         } else {
//           return `/email-verification/?email=${currentUser.email}`;
//         }
//       } else if (currentUser.user_type === 1 || currentUser.user_type === 4) {
//         return `/email-verification/?email=${currentUser.email}`;
//       } else if (currentUser.user_type === 2) {
//         return `/email-verification/?email=${currentUser.email}`;
//       } else {
//         return "/not-found";
//       }
//     };
  
//     const path = redirectTo();
//     router.push(path);
//   }, [currentUser, courseIdentifier, joinForFree]);
  
  
  
  
//   const postUserToDb = async () => {
//     try {
//       const response = await axiosInstance.post('/student/user');
//       console.log('POST request successful:', response.data);
//     } catch (error) {
//       console.error('Error making POST request:', error);
//     }
//   };
  
//     const onSubmit = async (e) => {
//       e.preventDefault();
//       if (!isSigningUp) {
//         try {
//           setIsSigningUp(true);
//           if (firstName.trim() === "" || lastName.trim() === "") {
//             throw new Error("First name and last name cannot be empty.");
//           }
  
//           if (password !== confirmPassword) {
//             throw new Error("Passwords do not match.");
//           }
  
//           const userCredential = await doCreateStudentWithEmailAndPassword(
//             email,
//             password,
//             firstName,
//             lastName, 
//             joinForFree
//           );
  
//           if (!userCredential || !userCredential.user) {
//             throw new Error("User credential is undefined.");
//           }
  
//           await postUserToDb();
  
//           if (!userCredential.user.emailVerified) {
//             console.log("Email not verified. Please verify your email before proceeding.");
//             await sendEmailVerification(userCredential.user.email);
//             setIsSigningUp(false);
  
  
//             router.push({
//               pathname: 'email-verification',
//               query: { 
//                 email: userCredential.user.email,
//                 courseIdentifier : courseIdentifier
//               }
//             });
//             return;
//           }
  
//           const user = userCredential.user;
  
//           const userDocRef = doc(db, "users", user.uid);
//           const userDoc = await getDoc(userDocRef);
  
//           if (userDoc.exists()) {
//             const userData = userDoc.data();
//             console.log("Additional user data from Firestore:", userData);
//             setCurrentUser(userData);
//           } else {
//             console.log("No additional user data found in Firestore.");
//           }
          
//           const token = await userCredential.user.getIdToken();
//           localStorage.setItem("token", token);
  
//           console.log("User created, token stored in local storage:", token);
//           localStorage.setItem("signupSuccessful", "true");
  
  
//           setIsSigningUp(false);
//         } catch (error) {
          
//           console.error("Error creating user or saving to Firestore:", error);
//           const customErrorMessage = mapFirebaseAuthError(error.code);
//           setErrorMessage(customErrorMessage);
//           setIsSigningUp(false);
//         }
//       }
//     };
  
//     const mapFirebaseAuthError = (errorCode) => {
//       switch (errorCode) {
//         case "auth/invalid-email":
//           return "The email address is not valid. Please check and try again.";
//         case "auth/email-already-in-use":
//           return "This email is already associated with an account. Please sign in.";
//         case "auth/weak-password":
//           return "The password is too weak. Please use a stronger password.";
//         case "auth/wrong-password":
//           return "The password you entered is incorrect.";
//         case "auth/user-not-found":
//           return "No user found with this email.";
//         case "auth/network-request-failed":
//           return "Network error. Please try again later.";
//         default:
//           return "An unexpected error occurred. Please try again.";
//       }
//     };
  
    const handleMouseEnter = () => {
      setShowTooltip(true);
    };
  
    const handleMouseLeave = () => {
      setShowTooltip(false);
    };
  
    const validatePassword = (password) => {
      const lengthValid = password.length >= 8 && password.length <= 30;
      const upperCaseValid = /[A-Z]/.test(password);
      const lowerCaseValid = /[a-z]/.test(password);
      const numberValid = /\d/.test(password);
      const specialCharValid = /[!@#$%^&*()+\-_=<>?]/.test(password);
  
      if (lengthValid && upperCaseValid && lowerCaseValid && numberValid && specialCharValid) {
        setPasswordStrengthColor("text-green-500");
        setPasswordValidationMessage("Strong password.");
      } else {
        setPasswordStrengthColor("text-red-500");
        setPasswordValidationMessage("Password must be 8-30 characters long and include upper and lower case letters, a number, and a special character.");
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
  
    useEffect(() => {
      if (showTooltip) {
        const timer = setTimeout(() => {
          setShowTooltip(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [showTooltip]);
  
    return (
      <TooltipProvider>
        <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 xl:h-screen bg-white text-gray-900 ">
          <div className="mx-auto max-w-sm my-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
            <p className="text-center text-muted-foreground mb-6">
              Enter your information to create an account
            </p>
            <form>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      placeholder="Enter First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className='rounded-[3px]'
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      placeholder="Enter Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className='rounded-[3px]'
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='rounded-[3px]'
                    required
                  />
                </div>
                <div className="grid gap-2 relative">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center">
                      Password
                      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                        <TooltipTrigger
                          asChild
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <CircleAlert className="ml-2 cursor-pointer text-gray-500 h-4" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="p-4 bg-white border rounded-[3px] shadow-lg">
                          <div className="text-xs text-[#464646]">
                            <p>Contain 8 to 30 characters</p>
                            <p>Contain both lower- and upper-case letters</p>
                            <p>Contain a number</p>
                            <p>Contain a special character, e.g.: -!@#$%^&*+</p>
                            <p>
                              Not contain a letter or number sequence, e.g.: ‘abc’,
                              ‘123’, ‘4444’, ‘qwerty
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    className='rounded-[3px]'
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                  />
                  <p className={`mt-1 ${passwordStrengthColor} text-xs`}>{passwordValidationMessage}</p>
                </div>
                <div className="grid gap-2 relative">
                  <Label htmlFor="confirm-password">Re-enter Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className='rounded-[3px]'
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validatePasswordMatch(e.target.value);
                    }}
                    required
                  />
                  <p className={`mt-1 ${passwordMatchColor} text-xs`}>{passwordMatchMessage}</p>
                </div>
                {errorMessage && (
                  <span className="text-red-600 font-bold">{errorMessage}</span>
                )}
                <Button
                  type="submit"
                  className = "w-full"
                  disabled={isSigningUp}
                >
                  {isSigningUp ? "Signing Up..." : "Create an account"}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-[#2dac5c]  hover:underline">
                Log in
              </Link>
            </p>
          </div>
          
          <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-y-0 left-0 w-px bg-border"></div> 
          
            <Image
              src="/tree-house.jpg"
              alt="Signup Image"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </TooltipProvider>
    );
  };
  
  export default AdminSignup;
  