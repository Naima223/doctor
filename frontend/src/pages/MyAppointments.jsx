import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | upcoming | completed | canceled | pending

  async function load() {
    try {
      setLoading(true);
      const r = await client.get("/appointments/my");
      const list = Array.isArray(r?.data?.appointments) ? r.data.appointments : [];
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () { load(); }, []);

  async function onCancel(id) {
    try {
      await client.patch("/appointments/" + id + "/cancel");
      await load();
    } catch (e) { console.error(e); }
  }

  if (!localStorage.getItem("token") && !localStorage.getItem("qd_token")) {
    return <div className="p-6">Please login to view your appointments</div>;
  }

  const filtered = items.filter(function (x) {
    if (tab === "all") return true;
    return String(x.status) === tab;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My appointments</h2>

      <div className="flex gap-2 mb-6">
        <button onClick={function(){setTab("all");}} className={"px-3 py-2 border rounded " + (tab==="all"?"bg-black text-white":"")}>All</button>
        <button onClick={function(){setTab("upcoming");}} className={"px-3 py-2 border rounded " + (tab==="upcoming"?"bg-black text-white":"")}>Upcoming</button>
        <button onClick={function(){setTab("completed");}} className={"px-3 py-2 border rounded " + (tab==="completed"?"bg-black text-white":"")}>Completed</button>
        <button onClick={function(){setTab("canceled");}} className={"px-3 py-2 border rounded " + (tab==="canceled"?"bg-black text-white":"")}>Canceled</button>
        <button onClick={function(){setTab("pending");}} className={"px-3 py-2 border rounded " + (tab==="pending"?"bg-black text-white":"")}>Pending</button>
      </div>

      {loading && <div className="p-6 border rounded">Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div className="p-10 border rounded text-center text-gray-600">No appointments found</div>
      )}

      {!loading && filtered.length > 0 && (
        <ul className="grid gap-4">
          {filtered.map(function (a) {
            const dt = new Date(a.slotDate);
            const dateStr = isNaN(dt.getTime()) ? String(a.slotDate) : dt.toLocaleDateString();
            return (
              <li key={a._id} className="border rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={a.doctorAvatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(a.doctorName || "Doctor")}
                    className="w-20 h-20 rounded object-cover"
                    alt="doctor"
                  />
                  <div>
                    <p className="font-semibold">{a.doctorName}</p>
                    <p className="text-sm text-blue-600">{a.doctorSpeciality}</p>
                    <p className="text-sm">Date &amp; Time: {dateStr} | {a.slotTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={"text-xs px-2 py-1 rounded border " + (a.status==="upcoming"?"bg-blue-50 border-blue-200 text-blue-700":a.status==="completed"?"bg-green-50 border-green-200 text-green-700":a.status==="pending"?"bg-yellow-50 border-yellow-200 text-yellow-700":"bg-red-50 border-red-200 text-red-700")}>
                    {String(a.status).toUpperCase()}
                  </span>
                  {a.status !== "canceled" && a.status !== "completed" && (
                    <button onClick={function(){onCancel(a._id);}} className="px-3 py-2 text-sm border rounded">Cancel appointment</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
