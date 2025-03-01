import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import OwnerHeader from "../OwnerHeader";
import axios from "axios";

const API_URI = process.env.NEXT_PUBLIC_API_URL;

export default function hostelUpdate() {
    const router = useRouter();
    const [id, setId] = useState(null);

    const foodOptions = useRef([
        { label: "Breakfast", value: "1" },
        { label: "Lunch", value: "2" },
        { label: "Dinner", value: "3" },
    ]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm();

    const [apartmentData, setApartmentData] = useState();
    const [selectedFood, setSelectedFood] = useState([]);

    useEffect(() => {
        if (router.isReady) {
            setId(router.query.id);
        }
    }, [router.isReady, router.query.id]);

    useEffect(() => {
        axios
            .get(`${API_URI}/apartments/${id}`)
            .then((res) => {
                setApartmentData(res.data);
                console.log(res.data);
            })
            .catch((err) => console.error(err));
    }, [id]);

    // testing
    useEffect(() => {
        console.log(apartmentData);
    }, [apartmentData]);

    // Handle food selection
    const handleFoodSelection = (value) => {
        const updatedFood = selectedFood.includes(value)
            ? selectedFood.filter((food) => food !== value) // Remove if already selected
            : [...selectedFood, value]; // Add if not selected

        setApartmentData((prev) => ({
            ...prev,
            food: updatedFood.map(Number),
        }));
        setSelectedFood(updatedFood);
        setValue("food", updatedFood); // Update the form value
    };
    const handleOnChange = (value, key) => {
        setApartmentData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

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
                        <form onSubmit={} className="space-y-6">
                            {/* Title */}
                            <div>
                                <Label>Title</Label>
                                <Input
                                    {...register("title", { required: true })}
                                    placeholder="Apartment Title"
                                    onChange={(e) =>
                                        handleOnChange(e.target.value, "title")
                                    }
                                    value={apartmentData?.title}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">
                                        Title is required
                                    </p>
                                )}
                            </div>
                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    {...register("description", {
                                        required: true,
                                    })}
                                    placeholder="Describe the apartment"
                                    onChange={(e) =>
                                        handleOnChange(
                                            e.target.value,
                                            "description"
                                        )
                                    }
                                    value={apartmentData?.description}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        Description is required
                                    </p>
                                )}
                            </div>

                            {/* Rent */}
                            <div>
                                <Label>Rent (per month)</Label>
                                <Input
                                    type="number"
                                    {...register("rent", { required: true })}
                                    placeholder="Enter rent amount"
                                    onChange={(e) =>
                                        handleOnChange(e.target.value, "rent")
                                    }
                                    value={apartmentData?.rent}
                                />
                                {errors.rent && (
                                    <p className="text-sm text-red-500">
                                        Rent is required
                                    </p>
                                )}
                            </div>

                            {/* BHK */}
                            <div>
                                <Label>BHK</Label>
                                <Controller
                                    name="bhk"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setApartmentData((prev) => ({
                                                    ...prev,
                                                    bhk: value,
                                                }));
                                            }}
                                            value={apartmentData?.bhk}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select BHK" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1BHK">
                                                    1BHK
                                                </SelectItem>
                                                <SelectItem value="2BHK">
                                                    2BHK
                                                </SelectItem>
                                                <SelectItem value="3BHK">
                                                    3BHK
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.bhk && (
                                    <p className="text-sm text-red-500">
                                        BHK is required
                                    </p>
                                )}
                            </div>
                            {/* Room Sharing Type */}
                            <div>
                                <Label>Room Sharing Type</Label>
                                <Controller
                                    name="room_sharing_type"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setApartmentData((prev) => ({
                                                    ...prev,
                                                    room_sharing_type: value,
                                                }));
                                            }}
                                            value={
                                                apartmentData?.room_sharing_type
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sharing type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private">
                                                    Private
                                                </SelectItem>
                                                <SelectItem value="shared">
                                                    Shared
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.room_sharing_type && (
                                    <p className="text-sm text-red-500">
                                        Room sharing type is required
                                    </p>
                                )}
                            </div>
                            {/* Available Beds */}
                            <div>
                                <Label>Available Beds</Label>
                                <Input
                                    type="number"
                                    {...register("available_beds", {
                                        required: true,
                                    })}
                                    placeholder="Available beds"
                                    onChange={(e) =>
                                        handleOnChange(
                                            e.target.value,
                                            "total_beds"
                                        )
                                    }
                                    value={apartmentData?.total_beds}
                                />
                                {errors.available_beds && (
                                    <p className="text-sm text-red-500">
                                        Available beds is required
                                    </p>
                                )}
                            </div>

                            {/* Food Options */}
                            <div>
                                <Label>Food Options</Label>
                                <div className="flex gap-4">
                                    {foodOptions.current.map((food) => (
                                        <Button
                                            key={food.value}
                                            type="button"
                                            variant={
                                                selectedFood.includes(
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
                            <div>
                                <Label>Location</Label>
                                <Input
                                    {...register("location", {
                                        required: true,
                                    })}
                                    placeholder="Enter location"
                                    value={apartmentData?.location}
                                    onChange={(e) =>
                                        handleOnChange(
                                            e.target.value,
                                            "location"
                                        )
                                    }
                                />
                                {errors.location && (
                                    <p className="text-sm text-red-500">
                                        Location is required
                                    </p>
                                )}
                            </div>

                            {/* Latitude and Longitude */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number"
                                        {...register("latitude", {
                                            required: true,
                                        })}
                                        placeholder="Enter latitude"
                                        value={apartmentData?.latitude}
                                        onChange={(e) =>
                                            handleOnChange(
                                                e.target.value,
                                                "latitude"
                                            )
                                        }
                                    />
                                    {errors.latitude && (
                                        <p className="text-sm text-red-500">
                                            Latitude is required
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number"
                                        {...register("longitude", {
                                            required: true,
                                        })}
                                        placeholder="Enter longitude"
                                        value={apartmentData?.longitude}
                                        onChange={(e) =>
                                            handleOnChange(
                                                e.target.value,
                                                "longitude"
                                            )
                                        }
                                    />
                                    {errors.longitude && (
                                        <p className="text-sm text-red-500">
                                            Longitude is required
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Hostel Type */}
                            <div>
                                <Label>Hostel Type</Label>
                                <Controller
                                    name="hostel_type"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setApartmentData((prev) => ({
                                                    ...prev,
                                                    hostel_type: value,
                                                }));
                                            }}
                                            value={apartmentData?.hostel_type}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Hostel Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="boys">
                                                    Boys
                                                </SelectItem>
                                                <SelectItem value="girls">
                                                    Girls
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.hostel_type && (
                                    <p className="text-sm text-red-500">
                                        Hostel type is required
                                    </p>
                                )}
                            </div>

                            {/* Duration */}
                            <div>
                                <Label>Duration</Label>
                                <Controller
                                    name="duration"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setApartmentData((prev) => ({
                                                    ...prev,
                                                    duration: value,
                                                }));
                                            }}
                                            value={apartmentData?.duration}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="long-term">
                                                    Long-term
                                                </SelectItem>
                                                <SelectItem value="short-term">
                                                    Short-term
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.duration && (
                                    <p className="text-sm text-red-500">
                                        Duration is required
                                    </p>
                                )}
                            </div>

                            {/* Parking Available */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("parking_available")}
                                    checked={apartmentData?.parking_available}
                                    onChange={(e) =>
                                        handleOnChange(
                                            e.target.checked,
                                            "parking_available"
                                        )
                                    }
                                />
                                <Label>Parking Available</Label>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={!isFormValid()}>
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
