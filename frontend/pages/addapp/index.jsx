import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Card components
import { Input } from "@/components/ui/input"; // Input component
import { Textarea } from "@/components/ui/textarea"; // Textarea component
import { Label } from "@/components/ui/label"; // Label component
import { Button } from "@/components/ui/button"; // Button component
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Select components

const ApartmentForm = () => {
  const { register, handleSubmit, control, watch, setValue } = useForm();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePaths, setImagePaths] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const isAadharValid = true; // Replace with actual validation logic
  const isVerified = true; // Replace with actual verification logic

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const handleFoodSelection = (value) => {
    const updatedFood = selectedFood.includes(value)
      ? selectedFood.filter((food) => food !== value)
      : [...selectedFood, value];
    setSelectedFood(updatedFood);
    setValue("food", updatedFood);
  };

  return (
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
  );
};

export default ApartmentForm;