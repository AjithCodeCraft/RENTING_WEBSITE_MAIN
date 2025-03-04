import { useEffect } from "react";
import axios from "axios";

export function hexToBase64(hex) {
    return btoa(
        hex.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
    );
}

const useHostelData = (id, reset, setImages) => {
    async function fetch_apartment_data() {
        if (!id) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/apartments/${id}`)
             .then(res => {
                reset({
                    ...res.data,
                    food: res.data.food.map(String)
                });
             })
             .catch(console.error);
    }

    async function fetch_apartment_image_data() {
        if (!id) return;
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/apartment-images/${id}`)
            .then((res) => {
                let data = res.data?.images?.map((image) => ({
                    ...image,
                    image_data: `data:image/jpeg;base64,${hexToBase64(image.image_data)}`
                }));
                const data_length = data.length;
                for (let i = 0; i < 3 - data_length; i++) {
                    data.push({"image_data": null});
                }
                setImages(data.slice(0, 3));
            })
            .catch(console.error);
    }

    useEffect(() => {
        fetch_apartment_data()
        fetch_apartment_image_data();
    }, [id, reset]);
};

export default useHostelData;