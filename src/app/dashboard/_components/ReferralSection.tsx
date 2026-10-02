"use client";

import { useRouter } from "next/navigation";
import IntroduceMemberButton from "./IntroduceMemberButton";
import MemberIntakeForm from "./MemberIntakeForm";
import { submitReferral } from "../_lib/referralActions";

export default function ReferralSection() {
  const router = useRouter();

  return (
    <IntroduceMemberButton>
      {(close) => (
        <MemberIntakeForm
          action={submitReferral}
          submitLabel="Submit referral"
          submittingLabel="Submitting…"
          onSuccess={() => {
            close();
            router.refresh();
          }}
        />
      )}
    </IntroduceMemberButton>
  );
}
