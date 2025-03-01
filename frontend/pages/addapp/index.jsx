import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import OwnerHeader from "../owner/OwnerHeader";

export default function AddApartmentForm() {
  const router = useRouter();
  const [isAadharValid, setIsAadharValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  // Watch all required fields
  const watchedFields = watch([
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

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      watchedFields.every((field) => field !== undefined && field !== "") && // Check if all fields are filled
      isAadharValid && // Aadhar must be valid
      isVerified // User must be verified
    );
  };

  // Check verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const accessToken = localStorage.getItem("access_token_owner");
      if (!accessToken) {
        setErrorMessage("Authentication token not found");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/check-owner-verification/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: localStorage.getItem("email") }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsVerified(data.verified);
          setIsAadharValid(data.verified); // If the owner is verified, Aadhar is also considered valid
        } else {
          setErrorMessage(data.error || "Failed to check verification status");
        }
      } catch (error) {
        setErrorMessage("Network error");
      }
    };

    checkVerificationStatus();
  }, []);

  // Validate Aadhar number
  const handleValidate = async () => {
    const aadharNumber = watch("aadharNumber");
    if (aadharNumber.length !== 12) {
      setIsAadharValid(false);
      setErrorMessage("Invalid Aadhar Number");
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token_owner");
      if (!accessToken) {
        setErrorMessage("Authentication token not found");
        return;
      }

      const response = await fetch("http://localhost:8000/api/add-house-owner/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ SSN: aadharNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAadharValid(true);
        setIsVerified(true);
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to validate Aadhar");
      }
    } catch (error) {
      setErrorMessage("Network error");
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const accessToken = localStorage.getItem("access_token_owner");
    if (!accessToken) {
      setErrorMessage("Authentication token not found");
      return;
    }

    // Ensure `food` is always an array
    const foodOptions = data.food || [];

    const apartmentData = {
      title: data.title,
      description: data.description,
      rent: Number(data.rent),
      bhk: data.bhk,
      available_beds: Number(data.available_beds),
      total_beds: Number(data.total_beds),
      room_sharing_type: data.room_sharing_type,
      location: data.location,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      food: foodOptions.map(Number), // Map only if `foodOptions` is defined
      parking_available: data.parking_available || false,
      hostel_type: data.hostel_type,
      duration: data.duration,
    };

    try {
      // Step 1: Add the apartment
      const response = await fetch("http://localhost:8000/api/apartments/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(apartmentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add apartment");
      }

      console.log("Apartment added successfully:", result);
      const apartmentId = result.data.apartment_id; // Get the apartment ID from the response

      // Step 2: Upload images using the apartment ID
      if (imageFiles.length > 0) {
        await Promise.all(
          imageFiles.map((file) => uploadImage(file, apartmentId))
        );
      }

      // Redirect to the owner dashboard
      router.push("/owner");
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.message || "Failed to submit form");
    }
  };

  // Upload image to the server
  const uploadImage = async (file, apartmentId) => {
    const accessToken = localStorage.getItem("access_token_owner");
    if (!accessToken) {
      setErrorMessage("Authentication token not found");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // Append the image file
    formData.append("apartment_uuid", apartmentId); // Append the apartment UUID

    try {
      const response = await fetch("http://localhost:8000/api/apartment-images/add/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
        body: formData, // Send the form data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Image upload successful:", result);

      // Return the result (e.g., gridfs_id or other metadata)
      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage(error.message || "Failed to upload image");
      throw error;
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = e.target.files;
    setImageFiles([...imageFiles, ...files]); // Store the selected files in state for preview
  };

  // Handle food selection
  const handleFoodSelection = (value) => {
    const updatedFood = selectedFood.includes(value)
      ? selectedFood.filter((food) => food !== value) // Remove if already selected
      : [...selectedFood, value]; // Add if not selected

    setSelectedFood(updatedFood);
    setValue("food", updatedFood); // Update the form value
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <OwnerHeader />
    </header>
    <div className="max-w-3xl mx-auto my-8">
      {!isVerified && (
        <div className="mb-4">
          <Label htmlFor="aadharNumber">Aadhar Number</Label>
          <Input id="aadharNumber" {...register("aadharNumber")} placeholder="Enter 12-digit Aadhar number" />
          <Button onClick={handleValidate} className="mt-2">Validate</Button>
          {isVerified && <p className="text-sm text-green-500 mt-2">Aadhar Verified</p>}
          {errorMessage && <p className="text-sm text-red-500 mt-2">{errorMessage}</p>}
        </div>
      )}

      {/* Apartment Form - Disabled if Aadhar is not valid */}
      <Card className="max-w-3xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Add a New Apartment</CardTitle>
          <CardDescription>Fill in the details to list your apartment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <Label>Title</Label>
              <Input
                {...register("title", { required: true })}
                placeholder="Enter apartment title"
                disabled={!isAadharValid && !isVerified} />
              {errors.title && <p className="text-sm text-red-500">Title is required</p>}
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                {...register("description", { required: true })}
                placeholder="Describe the apartment"
                disabled={!isAadharValid && !isVerified} />
              {errors.description && <p className="text-sm text-red-500">Description is required</p>}
            </div>

            {/* Rent */}
            <div>
              <Label>Rent (per month)</Label>
              <Input
                type="number"
                {...register("rent", { required: true })}
                placeholder="Enter rent amount"
                disabled={!isAadharValid && !isVerified} />
              {errors.rent && <p className="text-sm text-red-500">Rent is required</p>}
            </div>

            {/* BHK */}
            <div>
              <Label>BHK</Label>
              <Controller
                name="bhk"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isAadharValid && !isVerified}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              {errors.bhk && <p className="text-sm text-red-500">BHK is required</p>}
            </div>

            {/* Room Sharing Type */}
            <div>
              <Label>Room Sharing Type</Label>
              <Controller
                name="room_sharing_type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isAadharValid && !isVerified}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sharing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              {errors.room_sharing_type && <p className="text-sm text-red-500">Room sharing type is required</p>}
            </div>

            {/* Available Beds */}
            <div>
              <Label>Available Beds</Label>
              <Input
                type="number"
                {...register("available_beds", { required: true })}
                placeholder="Available beds"
                disabled={!isAadharValid && !isVerified} />
              {errors.available_beds && <p className="text-sm text-red-500">Available beds is required</p>}
            </div>

            {/* Total Beds */}
            <div>
              <Label>Total Beds</Label>
              <Input
                type="number"
                {...register("total_beds", { required: true })}
                placeholder="Total beds"
                disabled={!isAadharValid && !isVerified} />
              {errors.total_beds && <p className="text-sm text-red-500">Total beds is required</p>}
            </div>

            {/* Food Options */}
            <div>
              <Label>Food Options</Label>
              <div className="flex gap-4">
                {[
                  { label: "Breakfast", value: "1" },
                  { label: "Lunch", value: "2" },
                  { label: "Dinner", value: "3" },
                ].map((food) => (
                  <Button
                    key={food.value}
                    type="button"
                    variant={selectedFood.includes(food.value) ? "default" : "outline"}
                    onClick={() => handleFoodSelection(food.value)}
                    disabled={!isAadharValid && !isVerified}
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
                {...register("location", { required: true })}
                placeholder="Enter location"
                disabled={!isAadharValid && !isVerified} />
              {errors.location && <p className="text-sm text-red-500">Location is required</p>}
            </div>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="text"
                  {...register("latitude", { required: true })}
                  placeholder="Enter latitude"
                  disabled={!isAadharValid && !isVerified} />
                {errors.latitude && <p className="text-sm text-red-500">Latitude is required</p>}
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="text"
                  {...register("longitude", { required: true })}
                  placeholder="Enter longitude"
                  disabled={!isAadharValid && !isVerified} />
                {errors.longitude && <p className="text-sm text-red-500">Longitude is required</p>}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isAadharValid && !isVerified}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Hostel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              {errors.hostel_type && <p className="text-sm text-red-500">Hostel type is required</p>}
            </div>

            {/* Duration */}
            <div>
              <Label>Duration</Label>
              <Controller
                name="duration"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isAadharValid && !isVerified}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long-term">Long-term</SelectItem>
                      <SelectItem value="short-term">Short-term</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              {errors.duration && <p className="text-sm text-red-500">Duration is required</p>}
            </div>

            {/* Parking Available */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("parking_available")}
                disabled={!isAadharValid && !isVerified} />
              <Label>Parking Available</Label>
            </div>

            {/* Apartment Images */}
            <div>
              <Label>Apartment Images</Label>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={!isAadharValid && !isVerified} />
              <div className="mt-4">
                {imageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="w-32 h-32">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="object-cover w-full h-full rounded-md" />
                        <p className="text-xs text-center mt-2">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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