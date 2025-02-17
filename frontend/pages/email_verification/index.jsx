import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";  // Import the auth object
import { useRouter } from "next/router";

const VerificationPage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This checks if the user is authenticated and their email is verified.
    const checkVerificationStatus = async () => {
      const user = auth.currentUser;  // Use the imported 'auth' object
      if (user) {
        await user.reload();  // Refresh user data to get updated email verification status
        if (user.emailVerified) {
          setIsVerified(true);
          router.push("/login");  // Redirect to login page after successful verification
        }
      }
    };

    // Setting an interval to check verification status every 3 seconds
    const interval = setInterval(checkVerificationStatus, 3000); // Check every 3 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [router]);

  // Resend email verification if the user requests it
  const handleResendVerification = async () => {
    setResending(true);
    const user = auth.currentUser;  // Use the imported 'auth' object
    if (user) {
      try {
        await user.sendEmailVerification();
        alert("Verification email sent again!");
      } catch (error) {
        alert("Error sending verification email: " + error.message);
      }
    }
    setResending(false);
  };

  // Redirect to a different page if email is verified
  if (isVerified) {
    return <p>Your email is verified! Redirecting...</p>;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Email Verification Pending</h1>
        <p className="mt-4">Please check your inbox for the verification email.</p>
        <p>If you haven't received it, you can 
          <button 
            onClick={handleResendVerification} 
            disabled={resending} 
            className="text-blue-500 underline">
            {resending ? "Resending..." : "Resend Email"}
          </button>.
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;
