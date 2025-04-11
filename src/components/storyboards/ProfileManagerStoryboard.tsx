import React from "react";
import ProfileManager from "../profiles/ProfileManager";

export default function ProfileManagerStoryboard() {
  return (
    <div className="bg-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Profiles</h1>
      <ProfileManager />
    </div>
  );
}
