import React from "react";
import LicenseCard from "../dashboard/LicenseCard";

export default function LicenseCardWithVerificationStoryboard() {
  return (
    <div className="p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Unverified license with subscription */}
        <LicenseCard
          id="1"
          productName="Autovoter"
          licenseKey="AUT-X7Y9Z2-20240401"
          hwid={null}
          lastResetDate={null}
          active={false}
          subscriptionId="sub_123456789"
          price={500}
          currency="USD"
          verificationStatus="unverified"
        />

        {/* Active license with subscription */}
        <LicenseCard
          id="2"
          productName="Factionsbot 1.18.2"
          licenseKey="FAC-A1B2C3-20240315"
          hwid="ABC123DEF456GHI789"
          lastResetDate={new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString()}
          active={true}
          subscriptionId="sub_987654321"
          price={2500}
          currency="USD"
          verificationStatus="verified"
        />
      </div>
    </div>
  );
}
