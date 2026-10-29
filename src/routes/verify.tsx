import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, PhotoDrop } from "@/components/shared";
import { useApp, useMe } from "@/store/app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify your identity — CampusSphare" }, { name: "description", content: "A quick 4-step identity check so spaces stay safe." }, { property: "og:title", content: "Verify identity — CampusSphare" }, { property: "og:description", content: "Quick identity check." }] }),
  component: Verify,
});

const STEPS = ["Your details", "ID card", "OTP", "Result"];

function Verify() {
  const me = useMe();
  const verify = useApp((s) => s.verify);
  const [step, setStep] = useState(me.verified === "none" ? 0 : 3);
  const [kind, setKind] = useState<"student" | "citizen">(me.kind === "citizen" ? "citizen" : "student");
  const [email, setEmail] = useState(me.email);
  const [enr, setEnr] = useState(me.enrollment ?? "");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState("Aadhaar card");
  const [photos, setPhotos] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [result, setResult] = useState<"verified" | "pending">(me.verified === "pending" ? "pending" : "verified");

  const next = () => {
    setErr("");
    if (step === 0) {
      if (kind === "student") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          return setErr("Please enter a valid email address (e.g. name@college.edu.in)");
        }
        if (!enr.trim() || enr.trim().length < 3) {
          return setErr("Enrollment ID should be at least 3 characters (e.g. SXC22PHY041 or your college ID)");
        }
      } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
        return setErr("Enter a valid 10-digit phone number");
      }
    }
    if (step === 1 && photos.length === 0) {
      return setErr("Please upload an ID card photo, or click 'Use demo sample photo'");
    }
    if (step === 2) {
      if (!/^\d{6}$/.test(otp)) return setErr("Enter all 6 digits");
      const r = "verified";
      setResult(r);
      verify(r, { email: email.trim(), enrollment: enr.trim().toUpperCase() });
    }
    setStep(step + 1);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Verify your identity</h1>
      <p className="mt-1 text-muted-foreground">Done once. It keeps labs and equipment safe for everyone.</p>
      <ol className="my-8 flex items-center" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span aria-current={i === step ? "step" : undefined} className={cn("grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold transition-colors", i < step ? "border-st-approved bg-st-approved text-primary-foreground" : i === step ? "border-primary text-primary" : "border-border text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="text-xs">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("mx-2 mb-5 h-0.5 flex-1", i < step ? "bg-st-approved" : "bg-border")} />}
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role type</span>
              <button
                type="button"
                onClick={() => {
                  if (kind === "student") {
                    setEmail("aarav.s@stxavier.edu.in");
                    setEnr("SXC22PHY041");
                  } else {
                    setPhone("9876543210");
                    setIdType("Aadhaar card");
                  }
                  setErr("");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                ⚡ Fill demo details
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="I am a">
              {(["student", "citizen"] as const).map((k) => (
                <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cn("rounded-xl border p-3 text-sm font-medium", kind === k && "border-primary bg-primary/5")}>{k === "student" ? "College student" : "Community member"}</button>
              ))}
            </div>
            {kind === "student" ? (
              <>
                <Field label="College email" htmlFor="em" hint="Accepts your college email (e.g. @kiet.edu.in, @stxavier.edu.in, or any email)">
                  <Input id="em" placeholder="e.g. yourname@kiet.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Enrollment ID" htmlFor="enr" hint="Printed on your college ID, e.g. SXC22PHY041, KIET25CSE, or your college roll number">
                  <Input id="enr" placeholder="e.g. SXC22PHY041" value={enr} onChange={(e) => setEnr(e.target.value.toUpperCase())} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Phone number" htmlFor="ph"><Input id="ph" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" /></Field>
                <Field label="Government ID type" hint="We only check the type and photo — we never store the number.">
                  <Select value={idType} onValueChange={setIdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Aadhaar card", "Voter ID", "PAN card", "Driving licence"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
                </Field>
              </>
            )}
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Upload your {kind === "student" ? "college ID card" : idType}</h2>
              <button
                type="button"
                onClick={() => {
                  setPhotos(["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=70"]);
                  setErr("");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                ⚡ Use demo sample photo
              </button>
            </div>
            <PhotoDrop value={photos} onChange={setPhotos} max={2} label="Drag your ID photo here, or click to choose" />
            <p className="mt-3 text-xs text-muted-foreground">Tip: Cover your ID number with your finger — we only need your name and photo.</p>
          </div>
        )}
        {step === 2 && (
          <div className="text-center">
            <h2 className="font-semibold">Enter the 6-digit code</h2>
            <p className="mb-5 text-sm text-muted-foreground">We sent it to {kind === "student" ? email : phone}. (Demo: any 6 digits work.)</p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} aria-label="One-time code">
                <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />)}</InputOTPGroup>
              </InputOTP>
            </div>
            <button type="button" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline" onClick={() => setOtp("123456")}>⚡ Fill demo code (123456)</button>
          </div>
        )}
        {step === 3 && (
          <div className="py-4 text-center">
            {result === "verified" ? (
              <><ShieldCheck className="mx-auto h-16 w-16 text-st-approved" /><h2 className="mt-3 text-xl font-bold">You're verified!</h2><p className="mt-1 text-muted-foreground">A green shield now appears next to your name. Your requests can be approved.</p></>
            ) : (
              <><Clock className="mx-auto h-16 w-16 text-st-pending" /><h2 className="mt-3 text-xl font-bold">Pending review</h2><p className="mt-1 text-muted-foreground">An admin will check your ID within 24 hours. You'll get a notification.</p></>
            )}
            <div className="mt-6 flex justify-center gap-2">
              <Button asChild variant="hero"><Link to="/bookings">Go to my bookings</Link></Button>
              <Button asChild variant="outline"><Link to="/discover">Discover more</Link></Button>
            </div>
          </div>
        )}
        {err && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{err}</p>}
        {step < 3 && (
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            <Button variant="hero" onClick={next}>{step === 2 ? "Verify" : "Next"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

