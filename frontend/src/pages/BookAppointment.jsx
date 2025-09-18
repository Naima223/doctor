import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [complaint, setComplaint] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // build today's YYYY-MM-DD for min date
  const today = (function () {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  })();

  useEffect(function () {
    async function loadDoctor() {
      try {
        const r = await client.get("/doctors");
        const arr = Array.isArray(r && r.data && r.data.doctors) ? r.data.doctors : [];
        const d = arr.find(function (x) {
          return (x._id && x._id === doctorId) || (x.id && x.id === doctorId);
        });
        setDoctor(d || null);
      } catch (e) {
        setDoctor(null);
      }
    }
    loadDoctor();
  }, [doctorId]);

  async function submit() {
    if (!dateStr || !timeStr) {
      alert("Please select date and time");
      return;
    }
    try {
      setSubmitting(true);
      await client.post("/appointments", {
        doctorId: doctorId,
        slotDate: dateStr,
        slotTime: timeStr,
        complaint: complaint
      });
      navigate("/my-appointments");
    } catch (e) {
      const msg = e && e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message;
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Book Appointment</h2>

      {!doctor && (
        <div className="mb-6 p-4 border rounded">
          <div className="mb-3">Loading doctor info...</div>
          <button
            onClick={function(){ navigate(-1); }}
            className="px-3 py-2 border rounded"
          >
            Go Back
          </button>
        </div>
      )}

      {doctor && (
        <div className="mb-6 p-4 border rounded flex items-center gap-4">
          <img
            src={doctor.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.name || "Doctor")}
            className="w-16 h-16 rounded object-cover"
            alt="doctor"
          />
          <div>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-sm text-blue-600">{doctor.speciality}</p>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <label className="text-sm">
          Date
          <input
            value={dateStr}
            onChange={function (e) { setDateStr(e.target.value); }}
            type="date"
            min={today}
            className="w-full border rounded p-2 mt-1"
          />
        </label>

        <label className="text-sm">
          Time
          <select
            value={timeStr}
            onChange={function (e) { setTimeStr(e.target.value); }}
            className="w-full border rounded p-2 mt-1"
          >
            <option value="">Select a time</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="10:30 AM">10:30 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="11:30 AM">11:30 AM</option>
            <option value="12:00 PM">12:00 PM</option>
          </select>
        </label>

        <label className="text-sm">
          Complaint (optional)
          <textarea
            value={complaint}
            onChange={function (e) { setComplaint(e.target.value); }}
            rows="3"
            className="w-full border rounded p-2 mt-1"
            placeholder="Headache, fever, etc."
          />
        </label>

        <button
          onClick={submit}
          disabled={submitting}
          className="mt-2 w-full py-3 rounded bg-green-600 text-white"
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
