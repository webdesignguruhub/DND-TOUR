// js/cloudinary.js

// 🔴 Replace with your details
const CLOUD_NAME = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "YOUR_UNSIGNED_UPLOAD_PRESET";

export async function uploadImageToCloudinary(file) {
  if (!file) throw new Error("No file provided");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url; // image URL
}
