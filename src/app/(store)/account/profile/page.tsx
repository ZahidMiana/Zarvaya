"use client";

import { useEffect, useState } from "react";

type ProfileShape = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  dateOfBirth?: string;
  gender?: string;
};

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<ProfileShape | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/user/profile");
      const result = await response.json();
      if (response.ok && result?.data) {
        setProfile(result.data);
      }
    };

    void load();
  }, []);

  const updateField = <K extends keyof ProfileShape>(field: K, value: ProfileShape[K]) => {
    setProfile((current) => (current ? { ...current, [field]: value } : current));
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : undefined,
        gender: profile.gender,
      };

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update profile");
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <section className="rounded-3xl border border-stone-200 bg-white p-6 text-sm shadow-[0_10px_24px_rgba(26,26,26,0.05)]">Loading profile...</section>;
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      <h1 className="font-playfair text-4xl text-charcoal">My Profile</h1>
      {message ? <p className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-charcoal/75">{message}</p> : null}

      <form onSubmit={saveProfile} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_10px_24px_rgba(26,26,26,0.05)] sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-charcoal/75">
            <span className="text-xs">Full Name</span>
            <input value={profile.name ?? ""} onChange={(event) => updateField("name", event.target.value)} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm" required />
          </label>

          <label className="space-y-1 text-sm text-charcoal/75">
            <span className="text-xs">Email</span>
            <input value={profile.email ?? ""} onChange={(event) => updateField("email", event.target.value)} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm" type="email" />
          </label>

          <label className="space-y-1 text-sm text-charcoal/75">
            <span className="text-xs">Date of Birth</span>
            <input
              value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : ""}
              onChange={(event) => updateField("dateOfBirth", event.target.value)}
              className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm"
              type="date"
            />
          </label>

          <label className="space-y-1 text-sm text-charcoal/75">
            <span className="text-xs">Gender</span>
            <select value={profile.gender ?? ""} onChange={(event) => updateField("gender", event.target.value)} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-sm">
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-charcoal/70">
          <p>Phone: {profile.phone ?? "-"} {profile.isPhoneVerified ? "✓ verified" : "(not verified)"}</p>
          <p>Email verification: {profile.isEmailVerified ? "Verified" : "Pending"}</p>
        </div>

        <button type="submit" disabled={saving} className="mt-4 h-11 rounded-full bg-charcoal px-5 text-sm text-cream disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}
