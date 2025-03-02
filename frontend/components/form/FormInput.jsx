import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function FormInput({ label, name, type, placeholder, register, error }) {
    return (
        <div>
            <Label>{label}</Label>
            <Input
                type={type ? "text" : type}
                {...register(name, { required: true })}
                placeholder={placeholder}
            />
            {error && (
                <p className="text-sm text-red-500">{label} is required</p>
            )}
        </div>
    );
}
