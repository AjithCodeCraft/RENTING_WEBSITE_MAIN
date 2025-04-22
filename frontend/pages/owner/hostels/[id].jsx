import React, { useState, useEffect, useRef, use } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import OwnerHeader from "../OwnerHeader";
import FormSelect from "@/components/form/FormSelect";
import FormInput from "@/components/form/FormInput";
import useHostelData from "@/hooks/useHostelData";
import ImageUploader from "@/components/form/ImageUploader";
import { Divider } from "@mui/material";
import { ImageSourceMLGL } from "@maptiler/sdk";
import { useWatch } from "react-hook-form";
import axios from "axios";
import ConfimationPopup, { Popup } from "@/components/Popup";
import Cookies from 'js-cookie';


export default function hostelUpdate() {
    const router = useRouter();
    const [id, setId] = useState();
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);
    const [isOpenUpdatePopup, setIsOpenUpdatePopup] = useState(false);
    const [isOpenDeletePopup, setIsOpenDeletePopup] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const access = useRef("");

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useForm();

    useHostelData(id, reset, setImages);

    const foodOptions = [
        { label: "Breakfast", value: "1" },
        { label: "Lunch", value: "2" },
        { label: "Dinner", value: "3" },
    ];

    const hostelTypeOptions = [
        { label: "Boys", value: "boys" },
        { label: "Girls", value: "girls" },
    ];

    const durationOptions = [
        { label: "Long-term", value: "long-term" },
        { label: "Short-term", value: "short-term" },
    ];

    const roomSharingOptions = [
        { label: "Private", value: "private" },
        { label: "Shared", value: "shared" },
    ];

    const bhkOptions = [
        { label: "1BHK", value: "1BHK" },
        { label: "2BHK", value: "2BHK" },
        { label: "3BHK", value: "3BHK" },
    ];

    const watchFields = useWatch({
        control,
        name: [
            "title",
            "description",
            "rent",
            "bhk",
            "available_beds",
            "total_beds",
            "room_sharing_type",
            "location",
            "latitude",
            "longitude",
            "hostel_type",
            "duration",
        ],
    });

    useEffect(() => {
        if (router.isReady) {
            setId(router.query.id);
        }
    }, [router]);

    useEffect(() => {
        const isValid = watchFields.every(
            (field) => field !== undefined && field !== ""
        );
        setIsFormValid(isValid);
    }, [watchFields]);

    useEffect(() => {
        access.current = Cookies.get("access_token_owner");
    }, []);

    // Handle food selection
    const handleFoodSelection = (value) => {
        let selectedFood = watch("food") || [];
        if (selectedFood.includes(value)) {
            selectedFood = selectedFood.filter((food) => food !== value);
        } else {
            selectedFood = [...selectedFood, value];
        }
        setValue("food", selectedFood); // Update the form value
    };

    async function updateImage(image, image_id) {
        const data = new FormData();
        data.append("image", image);

        try {
            axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/apartment-image/update/${image_id}/`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${access.current}`,
                    },
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function addImage(image, isPrimary) {
        const data = new FormData();
        data.append("apartment_uuid", id);
        data.append("image", image);
        data.append("is_primary", isPrimary);
        console.log(data);
        try {
            axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/apartment-images/add/`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${access.current}`,
                    },
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    const updateApartmentData = async () => {
        const data = getValues();
        try {
            axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/apartments/${id}/`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${access.current}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleOnSubmit = async () => {
        await updateApartmentData();
        for (const key of Object.keys(imageFiles)) {
            const index = Number(key);
            if (images[index]?.image_id) {
                await updateImage(imageFiles[key], images[index].image_id);
            } else {
                await addImage(imageFiles[key], (index === 0));
            }
        }
        setIsOpenUpdatePopup(false);
        setPopupMessage("Successfully updated apartment details!");
        setIsPopupOpen(true);
    };

    const handleCancelClick = () => {
        router.push("/owner/hostels");
    };

    const handleFileUpdate = (file, index) => {
        setImageFiles((prev) => ({ ...prev, [index]: file }));
    };

    const handleApartmentDelete = async () => {
        try {
            axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/apartments/${id}/`, {
                headers: {
                    Authorization: `Bearer ${access.current}`,
                },
                withCredentials: true
            });
        } catch (error) {
            console.log(error);
        }
        setIsOpenDeletePopup(false);
        setPopupMessage("Successfully deleted apartment!");
        setIsPopupOpen(true);
    }

    return (
        <>
            <header className="sticky top-0 z-50 bg-white shadow-md">
                <OwnerHeader />
            </header>
            <div className="max-w-3xl mx-auto my-8">
                <Card className="max-w-3xl mx-auto my-8">
                    <CardHeader>
                        <CardTitle>Update Apartment</CardTitle>
                        <CardDescription>
                            Change values in field to update apartment details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit(() => setIsOpenUpdatePopup(true))}
                            className="space-y-6"
                        >
                            {/* Title */}
                            <FormInput
                                label={"Title"}
                                type="text"
                                name={"title"}
                                placeholder={"Apartment Title"}
                                register={register}
                                error={errors.title}
                            />

                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    {...register("description", {
                                        required: true,
                                    })}
                                    placeholder="Describe the apartment"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        Description is required
                                    </p>
                                )}
                            </div>

                            {/* Rent */}
                            <FormInput
                                label={"Rent (per month)"}
                                type="decimal"
                                name={"rent"}
                                placeholder={"Enter rent amount"}
                                register={register}
                                error={errors.rent}
                            />

                            {/* BHK */}
                            <FormSelect
                                label={"BHK"}
                                name={"bhk"}
                                control={control}
                                options={bhkOptions}
                                placeholder={"Select BHK"}
                                error={errors.bhk}
                            />
                            {/* Room Sharing Type */}
                            <FormSelect
                                label={"Room Sharing Type"}
                                name={"room_sharing_type"}
                                control={control}
                                options={roomSharingOptions}
                                placeholder={"Select sharing type"}
                                error={errors.room_sharing_type}
                            />

                            {/* Available Beds */}
                            <FormInput
                                label={"Available Beds"}
                                type="number"
                                name={"available_beds"}
                                placeholder={"Available Beds"}
                                register={register}
                                error={errors.available_beds}
                            />

                            {/* Food Options */}
                            <div>
                                <Label>Food Options</Label>
                                <div className="flex gap-4">
                                    {foodOptions.map((food) => (
                                        <Button
                                            key={food.value}
                                            type="button"
                                            variant={
                                                watch("food")?.includes(
                                                    food.value
                                                )
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleFoodSelection(food.value)
                                            }
                                        >
                                            {food.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <FormInput
                                label={"Location"}
                                type="text"
                                name={"location"}
                                placeholder={"Enter location"}
                                register={register}
                                error={errors.location}
                            />

                            {/* Latitude and Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label={"Latitude"}
                                    type="decimal"
                                    name={"latitude"}
                                    placeholder={"Enter latitude"}
                                    register={register}
                                    error={errors.latitude}
                                />
                                <FormInput
                                    label={"Longitude"}
                                    type="decimal"
                                    name={"longitude"}
                                    placeholder={"Enter longitude"}
                                    register={register}
                                    error={errors.longitude}
                                />
                            </div>

                            {/* Hostel Type */}
                            <FormSelect
                                label={"Hostel Type"}
                                name={"hostel_type"}
                                control={control}
                                options={hostelTypeOptions}
                                placeholder={"Select Hostel Type"}
                                error={errors.hostel_type}
                            />

                            {/* Duration */}
                            <FormSelect
                                label={"Duration"}
                                name={"duration"}
                                control={control}
                                options={durationOptions}
                                placeholder={"Select Duration"}
                                error={errors.duration}
                            />

                            {/* Parking Available */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("parking_available")}
                                />
                                <Label>Parking Available</Label>
                            </div>

                            <Divider className="opacity-0" />
                            <Label className="my-4">Images</Label>
                            <div className="flex justify-center gap-8">
                                {images &&
                                    images.map((image, index) => (
                                        <ImageUploader
                                            key={image?.image_id || index}
                                            name={
                                                index === 0
                                                    ? "primary"
                                                    : `img${index}`
                                            }
                                            src={image?.image_data}
                                            onFileSelect={(file) =>
                                                handleFileUpdate(file, index)
                                            }
                                        />
                                    ))}
                            </div>

                            {/* Update, Delete and Cancel buttons */}
                            <div className="flex justify-center gap-4">
                                <Button
                                    className={"w-[70%]"}
                                    type="submit"
                                    disabled={!isFormValid}
                                >
                                    Update
                                </Button>
                                <Button
                                    className={
                                        "w-[15%] bg-red-500 hover:bg-red-600"
                                    }
                                    type="button"
                                    onClick={() => setIsOpenDeletePopup(true)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    className={
                                        "w-[15%] bg-blue-600 hover:bg-blue-500"
                                    }
                                    type="button"
                                    onClick={handleCancelClick}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Popup isOpen={isPopupOpen} message={popupMessage} 
            onClose={() => {router.push("/owner/hostels")}}
            />
            <ConfimationPopup
                key={"update"}
                isOpen={isOpenUpdatePopup}
                onClose={() => setIsOpenUpdatePopup(false)}
                message={"Are you sure you want to update?"}
                onConfirm={handleOnSubmit}
                button={{ message: "Update", color: "bg-green-600" }}
            />
            <ConfimationPopup key={"delete"} isOpen={isOpenDeletePopup}
                onClose={() => setIsOpenDeletePopup(false)}
                message={"Are you sure you wanna delete this apartment?"} 
                onConfirm={handleApartmentDelete}
                button={{ message: "Delete", color: "bg-red-600" }}
            />
        </>
    );
}
