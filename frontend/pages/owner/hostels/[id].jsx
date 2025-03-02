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

export default function hostelUpdate() {
    const router = useRouter();
    const [id, setId] = useState(null);
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState({});

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

    const foodOptions = useRef([
        { label: "Breakfast", value: "1" },
        { label: "Lunch", value: "2" },
        { label: "Dinner", value: "3" },
    ]);

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
        { label: "Shared", value: "shared" }
    ];

    const bhkOptions = [
        { label: "1BHK", value: "1BHK" },
        { label: "2BHK", value: "2BHK" },
        { label: "3BHK", value: "3BHK" }
    ];

    const watchFields = watch([
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
    ]);

    const [isFormValid, setIsFormValid] = useState(true);

    useEffect(() => {
        if (router.isReady) {
            setId(router.query.id);
        }
    }, [router.isReady, router.query.id]);


    useEffect(() => {
        const isValid = watchFields.every(
            (field) => field !== undefined && field !== ""
        );
        setIsFormValid(isValid);
    }, [watchFields]);

    useEffect(() => {console.log(images)}, [images]);

    // Handle food selection
    const handleFoodSelection = (value) => {
        const updatedFood = watch("food")?.includes(value)
            ? watch("food").filter((food) => food !== value) // Remove if already selected
            : [...(watch("food") || []), value]; // Add if not selected

        setValue("food", updatedFood); // Update the form value
    };


    const handleOnSubmit = () => {
        const values = getValues();
        console.log(values);
        console.log(imageFiles);
    };

    const handleFileUpdate = (file, index) => {
        setImageFiles(prev => ({...prev, [index]: file}));
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
                            onSubmit={handleSubmit(handleOnSubmit)}
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
                                    {foodOptions.current.map((food) => (
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

                            <div className="flex justify-center gap-8">
                                {images && images.map((image, index) => (
                                        <ImageUploader
                                            key={image?.image_id || index}
                                            name={
                                                index === 0
                                                    ? "primary"
                                                    : `img${index}`
                                            }
                                            src={image?.image_data}
                                            onFileSelect={(file) => handleFileUpdate(file, index)}
                                        />
                                    ))}
                            </div>

                            {/* Update, Delete and Cancel buttons */}
                            <div className="flex justify-center gap-4">
                                <Button className={"w-[70%]"} type="submit" disabled={!isFormValid}>
                                    Update
                                </Button>
                                <Button className={"w-[15%] bg-red-500 hover:bg-red-600"} type="submit" disabled={!isFormValid}>
                                    Delete
                                </Button>
                                <Button className={"w-[15%] bg-blue-600 hover:bg-blue-500"} type="submit" disabled={!isFormValid}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
