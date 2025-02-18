import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";  // Import the auth object
import { useRouter } from "next/router";

const VerificationPage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setIsVerified(true);

          // Get email and password from localStorage (saved during signup)
          const email = localStorage.getItem("email");
          const password_hash = localStorage.getItem("password");

          if (!email || !password_hash) {
            console.error("Missing email or password for login.");
            router.push("/login");
            return;
          }

          try {
            // Call login API
            const loginResponse = await fetch("http://127.0.0.1:8000/api/login/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password_hash }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
              // Store access_token in localStorage
              localStorage.setItem("access_token", loginData.access);

              // Get user_type from localStorage
              const userType = localStorage.getItem("user_type");

              // Redirect based on user type
              if (userType === "owner") {
                router.push("/addapp");
              } else {
                router.push("/login");
              }
            } else {
              console.error("Login failed:", loginData.message);
              router.push("/login");
            }
          } catch (error) {
            console.error("Error logging in:", error);
            router.push("/login");
          }
        }
      }
    };

    // Check verification status every 3 seconds
    const interval = setInterval(checkVerificationStatus, 3000);
    return () => clearInterval(interval);
  }, [router]);

  const handleResendVerification = async () => {
    setResending(true);
    const user = auth.currentUser;
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

  if (isVerified) {
    return <p>Your email is verified! Redirecting...</p>;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Email Verification Pending</h1>
        <p className="mt-4">Please check your inbox for the verification email.</p>
        <p>
          If you haven't received it, you can{" "}
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