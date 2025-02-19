import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function AddApartmentForm() {
  const router = useRouter();
  const [isAadharValid, setIsAadharValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

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
        body: JSON.stringify(apartmentData),  // Ensure direct JSON structure
      });

      console.log("Apartment Data being sent:", apartmentData);

      const result = await response.json();

      if (response.ok) {
        console.log("Apartment added successfully!");
        router.push("/apartments");
      } else {
        setErrorMessage(result.error || "Failed to add apartment");
      }
    } catch (error) {
      setErrorMessage("Network error");
    }
  };


  return (
    <div className="max-w-3xl mx-auto my-8">
      {/* Aadhar Number Input */}
      <div className="mb-4">
        <Label htmlFor="aadharNumber">Aadhar Number</Label>
        <Input id="aadharNumber" {...register("aadharNumber")} placeholder="Enter 12-digit Aadhar number" />
        <Button onClick={handleValidate} className="mt-2">Validate</Button>
        {isVerified && <p className="text-sm text-green-500 mt-2">Aadhar Verified</p>}
        {errorMessage && <p className="text-sm text-red-500 mt-2">{errorMessage}</p>}
      </div>

      {/* Apartment Form - Disabled if Aadhar is not valid */}
      <Card className="max-w-3xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Add a New Apartment</CardTitle>
          <CardDescription>Fill in the details to list your apartment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Title</Label>
              <Input {...register("title")} placeholder="Enter apartment title" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Describe the apartment" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Rent (per month)</Label>
              <Input type="number" {...register("rent")} placeholder="Enter rent amount" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>BHK</Label>
              <Select onValueChange={(value) => setValue("bhk", value)} disabled={!isAadharValid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1BHK">1BHK</SelectItem>
                  <SelectItem value="2BHK">2BHK</SelectItem>
                  <SelectItem value="3BHK">3BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Room Sharing Type</Label>
              <Select onValueChange={(value) => setValue("room_sharing_type", value)} disabled={!isAadharValid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sharing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Available Beds</Label>
              <Input type="number" {...register("available_beds")} placeholder="Available beds" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Total Beds</Label>
              <Input type="number" {...register("total_beds")} placeholder="Total beds" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Food Options</Label>
              <div className="flex gap-4">
                {["1", "2"].map((food) => (
                  <div key={food} className="flex items-center gap-2">
                    <Checkbox value={food} onCheckedChange={(checked) => {
                      const currentFood = watch("food") || [];
                      setValue("food", checked ? [...currentFood, food] : currentFood.filter((f) => f !== food));
                    }} disabled={!isAadharValid} />
                    <Label>{food}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input {...register("location")} placeholder="Enter location" disabled={!isAadharValid} />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input type="text" {...register("latitude")} placeholder="Enter latitude" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Longitude</Label>
              <Input type="text" {...register("longitude")} placeholder="Enter longitude" disabled={!isAadharValid} />
            </div>

            <div>
              <Label>Hostel Type</Label>
              <Select
                onValueChange={(value) => setValue("hostel_type", value)} //  Manually set value
                disabled={!isAadharValid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Hostel Type">
                    {watch("hostel_type")} {/* Display selected value */}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys</SelectItem>
                  <SelectItem value="girls">Girls</SelectItem>
                  <SelectItem value="co-ed">Co-ed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Dropdown */}
            <div>
              <Label>Duration</Label>
              <Select
                onValueChange={(value) => setValue("duration", value)}
                disabled={!isAadharValid}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Duration">
                    {watch("duration")} {/*  Display selected value */}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long-term">Long-term</SelectItem>
                  <SelectItem value="short-term">Short-term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={watch("parking_available") || false} // 
                onCheckedChange={(checked) => setValue("parking_available", checked)} // 
                disabled={!isAadharValid}
              />
              <Label>Parking Available</Label>
            </div>

            <div>
              <Label>Apartment Image Paths (Comma Separated)</Label>
              <Input
                type="text"
                placeholder="Enter image paths, separated by commas"
                onChange={(e) => setImagePaths(e.target.value.split(",").map(path => path.trim()))}
                disabled={!isAadharValid}
              />
            </div>
            <Button type="submit" disabled={!isAadharValid}>Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
