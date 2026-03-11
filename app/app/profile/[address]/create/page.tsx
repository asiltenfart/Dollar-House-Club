"use client";

import React, { useState, useRef, use } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function CreateRafflePage({ params }: PageProps) {
  const { address } = use(params);
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "house",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    street: "",
    city: "",
    stateProvince: "",
    country: "",
    postalCode: "",
    yearBuilt: "",
    targetValueUSD: "",
  });

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.propertyType) newErrors.propertyType = "Property type is required.";
    if (!form.bedrooms || parseInt(form.bedrooms) < 0) newErrors.bedrooms = "Enter number of bedrooms.";
    if (!form.bathrooms || parseInt(form.bathrooms) < 1) newErrors.bathrooms = "Enter number of bathrooms.";
    if (!form.squareFootage || parseInt(form.squareFootage) < 1) newErrors.squareFootage = "Enter square footage.";
    if (!form.street.trim()) newErrors.street = "Street address is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.stateProvince.trim()) newErrors.stateProvince = "State / Province is required.";
    if (!form.country.trim()) newErrors.country = "Country is required.";
    if (!form.yearBuilt || parseInt(form.yearBuilt) < 1800) newErrors.yearBuilt = "Enter a valid year.";
    if (!form.targetValueUSD || parseFloat(form.targetValueUSD) < 1000) {
      newErrors.targetValueUSD = "Target value must be at least $1,000.";
    }
    if (images.length < 3) newErrors.images = "Please upload at least 3 photos.";
    if (!proofFile) newErrors.proof = "Proof of ownership is required.";
    if (!agreedToTerms) newErrors.terms = "You must agree to the terms.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    addImages(files);
  };

  const addImages = (files: File[]) => {
    setImages((prev) => {
      const combined = [...prev, ...files].slice(0, 20);
      return combined;
    });
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    // Mock transaction
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    showToast("Your property raffle has been listed!", "success");
    router.push(`/profile/${address}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="6" y="12" width="16" height="12" rx="2" stroke="#FF385C" strokeWidth="1.5" />
            <path d="M10 12V9a4 4 0 018 0v3" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mb-2">Sign in to list a property</h2>
        <p className="text-sm text-[#717171] mb-6 max-w-xs">
          You need to be signed in to create a property raffle.
        </p>
        <Button onClick={openAuthModal}>Sign In</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div className="mb-8">
          <h1
            className="font-bold text-[#222222] mb-2"
            style={{ fontSize: "32px", letterSpacing: "-0.01em" }}
          >
            List your property
          </h1>
          <p className="text-sm text-[#717171]">
            Create a 30-day raffle. The yield from depositors funds your property&apos;s prize pool.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
          {/* SECTION 1: Property Details */}
          <FormSection title="Property Details">
            <Input
              label="Property title"
              placeholder="3BR Craftsman Bungalow in East Nashville"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
            />
            <Textarea
              label="Description"
              placeholder="Describe your property — features, neighborhood, what makes it special..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxChars={2000}
              rows={5}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Property type"
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
                error={errors.propertyType}
                options={[
                  { value: "house", label: "House" },
                  { value: "apartment", label: "Apartment" },
                  { value: "condo", label: "Condo" },
                  { value: "townhouse", label: "Townhouse" },
                  { value: "land", label: "Land" },
                  { value: "other", label: "Other" },
                ]}
              />
              <Input
                label="Year built"
                type="number"
                placeholder="1985"
                value={form.yearBuilt}
                onChange={(e) => set("yearBuilt", e.target.value)}
                error={errors.yearBuilt}
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Bedrooms"
                type="number"
                placeholder="3"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                error={errors.bedrooms}
                min={0}
              />
              <Input
                label="Bathrooms"
                type="number"
                placeholder="2"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
                error={errors.bathrooms}
                min={1}
              />
              <Input
                label="Square footage"
                type="number"
                placeholder="1600"
                value={form.squareFootage}
                onChange={(e) => set("squareFootage", e.target.value)}
                error={errors.squareFootage}
                min={1}
              />
            </div>
          </FormSection>

          {/* Location */}
          <FormSection title="Location">
            <Input
              label="Street address"
              placeholder="412 Fatherland St"
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              error={errors.street}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="Nashville"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                error={errors.city}
              />
              <Input
                label="State / Province"
                placeholder="Tennessee"
                value={form.stateProvince}
                onChange={(e) => set("stateProvince", e.target.value)}
                error={errors.stateProvince}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Country"
                placeholder="United States"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                error={errors.country}
              />
              <Input
                label="Postal code"
                placeholder="37206"
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
              />
            </div>
          </FormSection>

          {/* SECTION 2: Photos */}
          <FormSection title="Property Photos">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors duration-150"
              style={{
                borderColor: isDragOver ? "#FF385C" : errors.images ? "#C13515" : "#DDDDDD",
                background: isDragOver ? "#FFF0F3" : "transparent",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-3">
                <path d="M16 4v16M8 12l8-8 8 8" stroke="#717171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 24h24" stroke="#717171" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 28h16" stroke="#717171" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-semibold text-[#222222] mb-1">
                Drag photos here or click to upload
              </p>
              <p className="text-xs text-[#717171]">
                JPG, PNG, WebP · Max 5MB each · Min 3, max 20 photos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => addImages(Array.from(e.target.files ?? []))}
              />
            </div>
            {errors.images && <p className="text-xs text-[#C13515]">{errors.images}</p>}

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden bg-[#F7F7F7] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Property photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>

          {/* SECTION 3: Raffle Configuration */}
          <FormSection title="Raffle Configuration">
            <Input
              label="Target property value (USD)"
              type="number"
              placeholder="500000"
              prefix="$"
              value={form.targetValueUSD}
              onChange={(e) => set("targetValueUSD", e.target.value)}
              error={errors.targetValueUSD}
              hint="Minimum $1,000. This is your desired sale price funded by yield."
              min={1000}
            />
            <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-[8px]">
              <span className="text-sm text-[#717171]">Raffle duration</span>
              <span className="text-sm font-semibold text-[#222222]">30 days (fixed)</span>
            </div>
          </FormSection>

          {/* SECTION 4: Seller Verification */}
          <FormSection title="Seller Verification">
            <div>
              <p className="text-xs font-semibold text-[#222222] uppercase tracking-wide mb-2">
                Proof of Ownership
              </p>
              <div
                onClick={() => proofInputRef.current?.click()}
                className="border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer hover:border-[#222222] transition-colors"
                style={{ borderColor: errors.proof ? "#C13515" : "#DDDDDD" }}
              >
                {proofFile ? (
                  <p className="text-sm font-semibold text-[#008A05]">{proofFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#222222] mb-1">Upload proof of ownership</p>
                    <p className="text-xs text-[#717171]">Property deed, title, or ownership certificate (PDF or image)</p>
                  </>
                )}
                <input
                  ref={proofInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setProofFile(e.target.files[0]);
                      setErrors((prev) => ({ ...prev, proof: "" }));
                    }
                  }}
                />
              </div>
              {errors.proof && <p className="text-xs text-[#C13515] mt-1">{errors.proof}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => {
                    setAgreedToTerms(!agreedToTerms);
                    setErrors((prev) => ({ ...prev, terms: "" }));
                  }}
                  className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150"
                  style={{
                    borderColor: agreedToTerms ? "#FF385C" : errors.terms ? "#C13515" : "#DDDDDD",
                    background: agreedToTerms ? "#FF385C" : "white",
                  }}
                >
                  {agreedToTerms && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-[#717171]">
                  I confirm I am the legal owner of this property, have the right to list it, and agree to the{" "}
                  <a href="/terms" className="text-[#FF385C] underline">Seller Terms of Service</a>
                  {" "}and{" "}
                  <a href="/rules" className="text-[#FF385C] underline">Platform Rules</a>.
                </p>
              </label>
              {errors.terms && <p className="text-xs text-[#C13515] mt-2">{errors.terms}</p>}
            </div>
          </FormSection>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            {isSubmitting ? "" : "Create Raffle"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-[#222222] pb-3 border-b border-[#EBEBEB]">{title}</h2>
      {children}
    </div>
  );
}
