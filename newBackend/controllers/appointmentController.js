import Appointment from "../models/Appointment.js";
import Doctor from "../list/Doctor.js";

/* ---------- helpers ---------- */
function toUTCDateOnly(s) {
  // "YYYY-MM-DD" -> UTC midnight Date, avoids timezone shift
  const parts = String(s || "").split("-");
  if (parts.length !== 3) return new Date("invalid");
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
}


export const getMyAppointments = async (req, res) => {
  try {
    const uid = req.userId || (req.user && (req.user._id || req.user.id));
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Build filter
    const filter = { userId: uid };
    const q = req.query || {};

    if (q.status) {
      const s = String(q.status);
      if (s === "pending" || s === "upcoming" || s === "completed" || s === "canceled") {
        filter.status = s;
      }
    }

    // date range (inclusive)
    const hasFrom = typeof q.from === "string" && q.from.length >= 8;
    const hasTo = typeof q.to === "string" && q.to.length >= 8;
    if (hasFrom || hasTo) {
      filter.slotDate = {};
      if (hasFrom) {
        const fromD = toUTCDateOnly(q.from);
        if (!isNaN(fromD.getTime())) filter.slotDate.$gte = fromD;
      }
      if (hasTo) {
        const toD = toUTCDateOnly(q.to);
        if (!isNaN(toD.getTime())) filter.slotDate.$lte = toD;
      }
      if (Object.keys(filter.slotDate).length === 0) delete filter.slotDate;
    }

    // Optional pagination
    const page = q.page ? Number(q.page) : null;
    const limit = q.limit ? Number(q.limit) : null;

    let list;
    let total = 0;

    if (page && limit) {
      const skip = (page - 1) * limit;
      total = await Appointment.countDocuments(filter);
      list = await Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    } else {
      list = await Appointment.find(filter).sort({ createdAt: -1 }).lean();
    }

    // Attach doctor basics WITHOUT per-row await (avoid N+1)
    // 1) collect ids
    const doctorIds = [];
    for (let i = 0; i < list.length; i++) {
      const did = list[i].doctorId;
      if (did && doctorIds.indexOf(String(did)) === -1) {
        doctorIds.push(String(did));
      }
    }

    // 2) fetch all doctors once
    let doctors = [];
    if (doctorIds.length > 0) {
      doctors = await Doctor.find({ _id: { $in: doctorIds } })
        .select("name speciality specialization image")
        .lean();
    }

    // 3) build map
    const dmap = {};
    for (let i = 0; i < doctors.length; i++) {
      const d = doctors[i];
      const key = String(d._id || d.id);
      dmap[key] = d;
    }

    // 4) attach fields
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      const key = String(a.doctorId || "");
      const d = dmap[key];
      if (d) {
        a.doctorName = d.name;
        a.doctorSpeciality = d.speciality || d.specialization || "";
        a.doctorAvatar = d.image || null;
      }
    }

    // response
    if (page && limit) {
      return res.json({
        success: true,
        total: total,
        page: page,
        pageSize: limit,
        appointments: list
      });
    }

    return res.json({ success: true, appointments: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/* ---------- POST /api/appointments ---------- */
export const createAppointment = async (req, res) => {
  try {
    const uid = req.userId || (req.user && (req.user._id || req.user.id));
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const doctorId = req.body && req.body.doctorId;
    const slotDate = req.body && req.body.slotDate;
    const slotTime = req.body && req.body.slotTime;
    const complaint = (req.body && req.body.complaint) ? req.body.complaint : "";

    if (!doctorId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "doctorId, slotDate and slotTime are required" });
    }

    const doc = await Doctor.findById(doctorId).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doc.isActive) return res.status(400).json({ success: false, message: "Doctor is not available right now" });

    // timezone-safe date
    const when = toUTCDateOnly(slotDate);
    if (isNaN(when.getTime())) return res.status(400).json({ success: false, message: "Invalid date" });

    // Optional: prevent duplicates (pending/upcoming)
    const conflict = await Appointment.findOne({
      doctorId: doctorId,
      slotDate: when,
      slotTime: slotTime,
      status: { $in: ["pending", "upcoming"] }
    }).lean();

    if (conflict) {
      return res.status(409).json({ success: false, message: "This slot is already booked" });
    }

    const a = await Appointment.create({
      userId: uid,
      doctorId: doctorId,
      slotDate: when,
      slotTime: slotTime,
      complaint: complaint,
      status: "upcoming"
    });

    return res.status(201).json({ success: true, appointment: a });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const uid = req.userId || (req.user && (req.user._id || req.user.id));
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const id = req.params && req.params.id;
    const a = await Appointment.findOne({ _id: id, userId: uid });
    if (!a) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (a.status !== "upcoming" && a.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only upcoming or pending appointments can be canceled" });
    }

    a.status = "canceled";
    await a.save();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
