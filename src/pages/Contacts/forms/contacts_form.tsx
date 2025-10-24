import React from "react";
import { toast } from "react-hot-toast";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/common/Button";
import LocationSelector from "../../../components/common/LocationSelector";

interface ContactFormProps {
  formData: {
    name: string;
    phone_number: string;
    tag: string;
    country: string;
    state: string;
    city: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const sanitizeInput = (value: string) =>
  value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

const ContactForm: React.FC<ContactFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const handleChange = (field: string, value: string) => {
    const cleanedValue = sanitizeInput(value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: cleanedValue,
    }));
  };

  const handleLocationChange = (location: {
    country: string;
    state: string;
    city: string;
  }) => {
    setFormData((prev: any) => ({
      ...prev,
      ...location,
    }));
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const cleanedNumber = sanitizeInput(phoneNumber);
    const countryCodePattern = /^\+\d{1,4}\s*.+$/;
    return countryCodePattern.test(cleanedNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form data on submit:", formData); // Debug log

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.phone_number.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(formData.phone_number)) {
      toast.error(
        "Phone number must include country code (e.g., +91 8934838483)"
      );
      return;
    }

    if (!formData.tag.trim()) {
      toast.error("Tag is required");
      return;
    }

    if (!formData.country || !formData.country.trim()) {
      toast.error("Country is required");
      return;
    }

    // Log before submission
    console.log("Submitting form with data:", formData);

    onSubmit();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter contact name"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone_number">Phone Number *</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
          placeholder="Enter phone number with country code (e.g., +1 1234567890)"
          required
        />
      </div>

      <div>
        <Label htmlFor="tag">Tag *</Label>
        <Input
          id="tag"
          value={formData.tag}
          onChange={(e) => handleChange("tag", e.target.value)}
          placeholder="Enter tag (e.g., sales, support, marketing)"
          required
        />
      </div>

      <LocationSelector
        value={{
          country: formData.country,
          state: formData.state,
          city: formData.city,
        }}
        onChange={handleLocationChange}
        required={true}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update" : "Add"} Contact</Button>
      </div>
    </form>
  );
};

export default ContactForm;
