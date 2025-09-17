// src/pages/MyProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import api from "../api/client";

export default function MyProfile() {
  const { user } = useAuth(); // AuthProvider থেকে user (login/register response)
  const [me, setMe] = useState(user);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) {
          // তোমার backend এর route = GET /api/user/profile
          const { data } = await api.get("/user/profile");
          if (mounted) setMe(data.userData || data.user || null);
        } else {
          setMe(user);
        }
      } catch {
        // unauthorized হলে ProtectedRoute prevent করবে
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div className="py-10 text-center">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid md:grid-cols-[140px_1fr] gap-6 items-start">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden grid place-items-center text-xl font-semibold">
          {me?.image ? (
            <img src={me.image} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            (me?.name?.trim()?.split(" ")?.map(w => w[0]?.toUpperCase())?.slice(0,2).join("") || "U")
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div>
            <div className="text-gray-500 text-sm">Name</div>
            <div className="text-lg font-medium">{me?.name || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Email</div>
            <div className="text-lg font-medium">{me?.email || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Role</div>
            <div className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100">
              {me?.role || "user"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
