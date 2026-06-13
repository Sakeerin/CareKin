import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInviteFormAction } from "@/lib/actions/workspace";
import { requireUser } from "@/lib/auth/session";
import Link from "next/link";

export const metadata = { title: "ยอมรับคำเชิญ" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await requireUser();
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">ลิงก์เชิญไม่ถูกต้อง</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>ไป Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ยอมรับคำเชิญ</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={acceptInviteFormAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <p className="text-sm text-muted-foreground">
              คุณได้รับเชิญเข้าร่วม workspace บน CareKin
            </p>
            <Button type="submit" className="w-full">
              เข้าร่วม workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
