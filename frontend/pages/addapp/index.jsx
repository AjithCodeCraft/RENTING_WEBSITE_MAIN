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

export default function AddApartmentForm() {
  const router = useRouter();
  const [isAadharValid, setIsAadharValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePaths, setImagePaths] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm();

  // Check verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const accessToken = localStorage.getItem("access_token");
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
      const accessToken = localStorage.getItem("access_token");
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
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setErrorMessage("Authentication token not found");
      return;
    }

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
      food: data.food.map(Number),
      parking_available: data.parking_available || false,
      hostel_type: data.hostel_type,
      duration: data.duration,
    };

    try {
      const response = await fetch("http://localhost:8000/api/apartments/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(apartmentData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Apartment added successfully!");
        router.push("/owner");
      } else {
        setErrorMessage(result.error || "Failed to add apartment");
      }
    } catch (error) {
      setErrorMessage("Network error");
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = e.target.files;
    setImageFiles([...imageFiles, ...files]); // Store the selected files in state for preview

    // Upload each file and get the image path
    Array.from(files).forEach(uploadImage);
  };

  // Upload image to the server
  const uploadImage = async (file) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setErrorMessage("Authentication token not found");
      return;
    }

    const apartmentId = "apartment_uuid_here"; // Replace with the actual apartment ID you're working with

    const formData = new FormData();
    formData.append("image", file);
    formData.append("apartment", apartmentId); // Include the apartment ID
    formData.append("image_path", ""); // Initially set to an empty value; will be filled by the server if necessary

    try {
      const response = await fetch("http://localhost:8000/api/apartment-images/add/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      console.log("Image upload response:", result);

      if (response.ok) {
        setImagePaths((prevPaths) => [...prevPaths, result.image_path]);
      } else {
        setErrorMessage(result.error || "Failed to upload image");
      }
    } catch (error) {
      setErrorMessage("Network error");
      console.error("Network error:", error);
    }
  };

  // Handle food selection
  const handleFoodSelection = (value) => {
    const updatedFood = selectedFood.includes(value)
      ? selectedFood.filter((food) => food !== value)
      : [...selectedFood, value];
    setSelectedFood(updatedFood);
    setValue("food", updatedFood);
  };

  return (
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
                {...register("title")}
                placeholder="Enter apartment title"
                disabled={!isAadharValid && !isVerified}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                placeholder="Describe the apartment"
                disabled={!isAadharValid && !isVerified}
              />
            </div>

            {/* Rent */}
            <div>
              <Label>Rent (per month)</Label>
              <Input
                type="number"
                {...register("rent")}
                placeholder="Enter rent amount"
                disabled={!isAadharValid && !isVerified}
              />
            </div>

            {/* BHK */}
            <div>
              <Label>BHK</Label>
              <Controller
                name="bhk"
                control={control}
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
                )}
              />
            </div>

            {/* Room Sharing Type */}
            <div>
              <Label>Room Sharing Type</Label>
              <Controller
                name="room_sharing_type"
                control={control}
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
                )}
              />
            </div>

            {/* Available Beds */}
            <div>
              <Label>Available Beds</Label>
              <Input
                type="number"
                {...register("available_beds")}
                placeholder="Available beds"
                disabled={!isAadharValid && !isVerified}
              />
            </div>

            {/* Total Beds */}
            <div>
              <Label>Total Beds</Label>
              <Input
                type="number"
                {...register("total_beds")}
                placeholder="Total beds"
                disabled={!isAadharValid && !isVerified}
              />
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
                {...register("location")}
                placeholder="Enter location"
                disabled={!isAadharValid && !isVerified}
              />
            </div>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="text"
                  {...register("latitude")}
                  placeholder="Enter latitude"
                  disabled={!isAadharValid && !isVerified}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="text"
                  {...register("longitude")}
                  placeholder="Enter longitude"
                  disabled={!isAadharValid && !isVerified}
                />
              </div>
            </div>

            {/* Hostel Type */}
            <div>
              <Label>Hostel Type</Label>
              <Controller
                name="hostel_type"
                control={control}
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
                )}
              />
            </div>

            {/* Duration */}
            <div>
              <Label>Duration</Label>
              <Controller
                name="duration"
                control={control}
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
                )}
              />
            </div>

            {/* Parking Available */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("parking_available")}
                disabled={!isAadharValid && !isVerified}
              />
              <Label>Parking Available</Label>
            </div>

            {/* Apartment Images */}
            <div>
              <Label>Apartment Images</Label>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={!isAadharValid && !isVerified}
              />
              <div className="mt-4">
                {imageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="w-32 h-32">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="object-cover w-full h-full rounded-md"
                        />
                        <p className="text-xs text-center mt-2">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                {imagePaths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg">Uploaded Images</h4>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {imagePaths.map((imagePath, index) => (
                        <div key={index} className="w-32 h-32">
                          <img
                            src={imagePath}
                            alt={`uploaded-${index}`}
                            className="object-cover w-full h-full rounded-md"
                          />
                          <p className="text-xs text-center mt-2">Uploaded {index + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={!isAadharValid && !isVerified}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}