import { createContext, useState, useContext } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [unapprovedAppartments, setUnapprovedApartments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const contextValue = {
    unapprovedAppartments,
    setUnapprovedApartments,
    pendingCount,
    setPendingCount,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => useContext(AdminContext);
