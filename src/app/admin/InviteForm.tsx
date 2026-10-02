"use client";

import { useRouter } from "next/navigation";
import IntroduceMemberButton from "../dashboard/_components/IntroduceMemberButton";
import MemberIntakeForm from "../dashboard/_components/MemberIntakeForm";
import { inviteMember } from "./actions";

export default function InviteForm() {
  const router = useRouter();

  return (
    <IntroduceMemberButton>
      {(close) => (
        <MemberIntakeForm
          action={inviteMember}
          submitLabel="Invite member"
          submittingLabel="Inviting…"
          onSuccess={() => {
            close();
            router.refresh();
          }}
        />
      )}
    </IntroduceMemberButton>
  );
}
