// src/pages/MyProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import api from "../api/client";
import { toast } from "react-toastify";

export default function MyProfile() {
  const { user, loading } = useAuth();

  // local form state (prefill from user once available)
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setGender(user.gender || "");
      setDob(user.dob || "");
    }
  }, [user]);

  const displayImage = useMemo(() => {
    const name = user?.name || "User";
    return (
      user?.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=E5E7EB&color=111827&size=400`
    );
  }, [user]);

  const onSave = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: user.name, phone, address, gender, dob };
      const { data } = await api.put("/user/profile", payload);
      if (data?.success) {
        // keep local state in sync with server response
        const u = data.userData || {};
        setPhone(u.phone || "");
        setAddress(u.address || "");
        setGender(u.gender || "");
        setDob(u.dob || "");
        toast.success("Profile updated successfully");
      } else {
        toast.error(data?.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">You are not logged in</p>
          <p className="text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header: avatar + name */}
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 border">
            <img
              src={displayImage}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <div className="mt-2 h-px bg-gray-200" />
          </div>
        </div>

        {/* Form sections */}
        <form onSubmit={onSave} className="mt-8 space-y-8">
          {/* Contact Information */}
          <section>
            <h2 className="text-sm font-semibold tracking-wider uppercase underline underline-offset-4">
              Contact Information
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Email id:</label>
                <a
                  href={`mailto:${user.email}`}
                  className="text-primary underline break-all"
                >
                  {user.email}
                </a>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Phone:</label>
                <input
                  type="tel"
                  className="border rounded-lg p-3"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Address:</label>
                <textarea
                  rows={3}
                  className="border rounded-lg p-3"
                  placeholder="Street, City, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section>
            <h2 className="text-sm font-semibold tracking-wider uppercase underline underline-offset-4">
              Basic Information
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Gender:</label>
                <select
                  className="border rounded-lg p-3"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Not Selected</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Birthday:</label>
                <input
                  type="date"
                  className="border rounded-lg p-3"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Save button */}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save information"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
