import { SignupForm } from "@/components/app/auth-forms";

export const metadata = { title: "สมัครสมาชิก" };

export default function SignupPage() {
  return <SignupForm inviteRequired={process.env.LAUNCH_INVITE_REQUIRED === "true"} />;
}
