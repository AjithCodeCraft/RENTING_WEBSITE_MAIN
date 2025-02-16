"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ImagePlus, X, ArrowLeft } from "lucide-react" // Import ArrowLeft for the back button
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Zod schema for form validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  rent: z.number().min(0, "Rent must be a positive number"),
  duration: z.enum(["short-term", "long-term"]),
  roomSharingType: z.enum(["private", "shared"]),
  bhk: z.enum(["1BHK", "2BHK", "3BHK"]),
  parkingAvailable: z.boolean(),
  hostelType: z.enum(["boys", "girls"]),
  food: z.array(z.string()).optional(),
  images: z.array(z.instanceof(File)).optional(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
})

export default function HostelForm() {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parkingAvailable: false,
      food: [],
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Simulate API call to save hostel data
      console.log("Form Data:", data)
      toast.success("Hostel added successfully!")
      router.push("/owner/dashboard")
    } catch (error) {
      toast.error("Failed to add hostel. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files)
      setImages((prev) => [...prev, ...newImages])
      setValue("images", [...images, ...newImages])
    }
  }

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    setValue("images", updatedImages)
  }

  return (
    <Card className="max-w-3xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add a New Hostel</CardTitle>
            <CardDescription>Fill in the details to list your hostel.</CardDescription>
          </div>
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()} // Navigate back to the previous page
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Enter hostel title" />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe your hostel" />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Enter hostel location" />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>

          {/* Rent */}
          <div>
            <Label htmlFor="rent">Rent (per month)</Label>
            <Input
              id="rent"
              type="number"
              {...register("rent", { valueAsNumber: true })}
              placeholder="Enter rent amount"
            />
            {errors.rent && <p className="text-sm text-red-500">{errors.rent.message}</p>}
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <Select onValueChange={(value) => setValue("duration", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-term">Short-term</SelectItem>
                <SelectItem value="long-term">Long-term</SelectItem>
              </SelectContent>
            </Select>
            {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
          </div>

          {/* Room Sharing Type */}
          <div>
            <Label>Room Sharing Type</Label>
            <Select onValueChange={(value) => setValue("roomSharingType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select room sharing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
            {errors.roomSharingType && <p className="text-sm text-red-500">{errors.roomSharingType.message}</p>}
          </div>

          {/* BHK */}
          <div>
            <Label>BHK</Label>
            <Select onValueChange={(value) => setValue("bhk", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1BHK">1BHK</SelectItem>
                <SelectItem value="2BHK">2BHK</SelectItem>
                <SelectItem value="3BHK">3BHK</SelectItem>
              </SelectContent>
            </Select>
            {errors.bhk && <p className="text-sm text-red-500">{errors.bhk.message}</p>}
          </div>

          {/* Parking Available */}
          <div className="flex items-center gap-2">
            <Checkbox id="parkingAvailable" {...register("parkingAvailable")} />
            <Label htmlFor="parkingAvailable">Parking Available</Label>
          </div>

          {/* Hostel Type */}
          <div>
            <Label>Hostel Type</Label>
            <Select onValueChange={(value) => setValue("hostelType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hostel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boys">Boys</SelectItem>
                <SelectItem value="girls">Girls</SelectItem>
              </SelectContent>
            </Select>
            {errors.hostelType && <p className="text-sm text-red-500">{errors.hostelType.message}</p>}
          </div>

          {/* Food Options */}
          <div>
            <Label>Food Options</Label>
            <div className="flex gap-4">
              {["breakfast", "lunch", "dinner"].map((food) => (
                <div key={food} className="flex items-center gap-2">
                  <Checkbox
                    id={food}
                    value={food}
                    onCheckedChange={(checked) => {
                      const currentFood = watch("food") || []
                      if (checked) {
                        setValue("food", [...currentFood, food])
                      } else {
                        setValue(
                          "food",
                          currentFood.filter((f) => f !== food)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={food}>{food}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Longitude and Latitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                {...register("longitude", { valueAsNumber: true })}
                placeholder="Enter longitude"
              />
              {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message}</p>}
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                {...register("latitude", { valueAsNumber: true })}
                placeholder="Enter latitude"
              />
              {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Upload Images</Label>
            <div className="flex flex-wrap gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Hostel Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 p-1"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <label
                htmlFor="imageUpload"
                className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
              >
                <ImagePlus className="h-6 w-6 text-gray-500" />
              </label>
              <input
                id="imageUpload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding Hostel..." : "Add Hostel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}