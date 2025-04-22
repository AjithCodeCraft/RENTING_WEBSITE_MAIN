import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from 'js-cookie';


const withAuth = (WrappedComponent) => {
  return function AuthComponent(props) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const token = Cookies.get("access_token");

      if (!token) {
        router.replace("/login"); // Redirect to login if not authenticated
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
