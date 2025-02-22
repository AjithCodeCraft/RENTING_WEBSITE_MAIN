import {create} from "zustand";
import {persist} from "zustand/middleware";


const useApartmentStore = create(
    persist(
        (set) => ({
            approvedApartments: [{title: "", location: ""}],
            setApprovedApartments: (data) => set({ approvedApartments: data }),
            allUsers: {},
            setAllUsers: (data) => set({allUsers: data}),
        }),
        { name: "approved_apartments"}
    )
);

export default useApartmentStore;