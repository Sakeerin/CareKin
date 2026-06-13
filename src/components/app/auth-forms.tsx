import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAction, FormField } from "@/components/app/form-action";
import { Button } from "@/components/ui/button";
import { loginAction, signupAction } from "@/lib/actions/auth";

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
        <CardDescription>เข้าสู่บัญชี CareKin ของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        <FormAction action={loginAction} className="space-y-4">
          <FormField label="อีเมล" name="email" type="email" required />
          <FormField label="รหัสผ่าน" name="password" type="password" required />
          <Button type="submit" className="w-full">
            เข้าสู่ระบบ
          </Button>
        </FormAction>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function SignupForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>สมัครสมาชิก</CardTitle>
        <CardDescription>สร้างบัญชีเพื่อเริ่มดูแลครอบครัว</CardDescription>
      </CardHeader>
      <CardContent>
        <FormAction action={signupAction} className="space-y-4">
          <FormField label="ชื่อที่แสดง" name="displayName" required />
          <FormField label="อีเมล" name="email" type="email" required />
          <FormField label="รหัสผ่าน" name="password" type="password" required />
          <Button type="submit" className="w-full">
            สมัครสมาชิก
          </Button>
        </FormAction>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
