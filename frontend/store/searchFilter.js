import {create} from "zustand";
import {persist} from "zustand/middleware";

const useSearchFilterStore = create(
    persist(
        (set) => ({
            filters: {
                textSearch: '',
                rentMin: '',
                rentMax: '',
                duration: '',
                roomSharingType: '',
                parkingAvailable: false,
                hostelType: '',
                bhk: '',
            },
            setFilters: (update) => set((state) => ({
                filters: {
                    ...state.filters,
                    ...update,
                },
            })),
        }),
{
            name: "search_filters",
            getStorage: () => localStorage,
        }
    )
);

export default useSearchFilterStore;