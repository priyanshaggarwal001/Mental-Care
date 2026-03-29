import React, { useEffect, useMemo, useState } from "react";
import "./WellnessShared.css";
import "./ConsultingPage.css";
import { recordConsultBooking } from "./wellnessStats";
import { notifyBookingComplete, requestNotificationPermission } from "./notificationService";

function parseCounselorsCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  return lines.slice(1).map((line) => {
    const match = line.match(/^(\d+),([^,]+),"(.*)"$/);
    if (!match) return null;

    const id = Number(match[1]);
    const name = match[2].trim();
    const specialtiesRaw = match[3].split(",").map((item) => item.trim());

    let rating = null;
    const specialties = [];

    specialtiesRaw.forEach((item) => {
      if (item.startsWith("Rating:")) {
        const ratingValue = Number(item.replace("Rating:", "").replace("*", ""));
        rating = Number.isNaN(ratingValue) ? null : ratingValue;
      } else {
        specialties.push(item);
      }
    });

    return { id, name, rating, specialties };
  }).filter(Boolean);
}

function getConsultationFee(counselor) {
  const rating = counselor?.rating ?? 3.5;
  const normalized = Math.max(2.5, Math.min(5, rating));
  const fee = 399 + Math.round((normalized - 3.5) * 120);
  return Math.max(299, fee);
}

export default function ConsultingPage() {
  const [allCounselors, setAllCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (reason) {
      const decoded = decodeURIComponent(reason);
      setSearchText(decoded);
      setSelectedSpecialty(decoded);
    }

    const paymentStatus = params.get("payment");
    if (paymentStatus === "success") {
      const txId = params.get("transactionId") || "";
      recordConsultBooking(txId);

      const bookingData = {
        counselorName: params.get("counselor") || "Selected counselor",
        amount: Number(params.get("amount") || 0),
        bookingId: params.get("bookingId") || "N/A",
        transactionId: params.get("transactionId") || "N/A",
      };

      setPaymentSuccess({
        ...bookingData,
        method: params.get("method") || "Gateway",
      });

      // Trigger notifications
      notifyBookingComplete(bookingData);
      requestNotificationPermission();
    }
  }, []);

  useEffect(() => {
    async function loadCounselors() {
      try {
        const response = await fetch("/counselors.csv");
        const csvText = await response.text();
        setAllCounselors(parseCounselorsCsv(csvText));
      } catch (error) {
        setAllCounselors([]);
      } finally {
        setLoading(false);
      }
    }

    loadCounselors();
  }, []);

  const specialties = useMemo(() => {
    const set = new Set();
    allCounselors.forEach((counselor) => {
      counselor.specialties.forEach((specialty) => set.add(specialty));
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allCounselors]);

  const visibleCounselors = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return allCounselors
      .filter((counselor) => {
        const matchesSpecialty =
          selectedSpecialty === "All" || counselor.specialties.includes(selectedSpecialty);

        if (!matchesSpecialty) return false;
        if (!query) return true;

        const inName = counselor.name.toLowerCase().includes(query);
        const inSpecialties = counselor.specialties.some((item) =>
          item.toLowerCase().includes(query)
        );

        return inName || inSpecialties;
      })
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [allCounselors, searchText, selectedSpecialty]);

  function openPaymentForCounselor(counselor) {
    const amount = getConsultationFee(counselor);
    const redirectUrl = new URL("/index%20copy%202.html", window.location.origin);
    redirectUrl.searchParams.set("counselor", counselor.name);
    redirectUrl.searchParams.set("amount", String(amount));
    redirectUrl.searchParams.set("returnTo", "/index%20(1).html?tool=CONSULT");
    window.location.href = `${redirectUrl.pathname}?${redirectUrl.searchParams.toString()}`;
  }

  return (
    <div className="wellness-page">
      <div className="wellness-card consult-card">
        <h1 className="wellness-title">Find a Counselor</h1>
        <p className="wellness-subtitle">
          Search by concern and connect with the right counselor.
        </p>

        {paymentSuccess && (
          <div className="payment-success">
            <h3>Payment successful and slot reserved</h3>
            <p>
              {paymentSuccess.counselorName} | {paymentSuccess.method} | INR {paymentSuccess.amount}
            </p>
            <p>
              Booking: {paymentSuccess.bookingId} | Transaction: {paymentSuccess.transactionId}
            </p>
          </div>
        )}

        <div className="consult-filters">
          <input
            className="consult-input"
            type="text"
            placeholder="Search by name or concern"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select
            className="consult-select"
            value={selectedSpecialty}
            onChange={(event) => setSelectedSpecialty(event.target.value)}
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="consult-info">Loading counselors...</p>}

        {!loading && visibleCounselors.length === 0 && (
          <p className="consult-info">No counselors found for your filter.</p>
        )}

        <div className="consult-grid">
          {visibleCounselors.map((counselor) => (
            <article className="consult-item" key={counselor.id}>
              <h3>{counselor.name}</h3>
              <p className="consult-rating">Rating: {counselor.rating ?? "N/A"}</p>
              <p className="consult-tags">{counselor.specialties.join(" | ")}</p>
              <p className="consult-fee">Session Fee: INR {getConsultationFee(counselor)}</p>
              <button
                type="button"
                className="wellness-btn"
                onClick={() => openPaymentForCounselor(counselor)}
              >
                Book Consultation
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
