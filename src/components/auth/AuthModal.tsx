"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(8),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

type SuccessMode = "register" | "reset";

export default function AuthModal() {
  const router = useRouter();
  const { isModalOpen, modalView, pendingPhone, returnTo, prefillEmail, closeModal, setView, setPendingPhone } =
    useAuthStore();

  const [authTab, setAuthTab] = useState<"email" | "phone">("email");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInputs, setOtpInputs] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState<SuccessMode>("reset");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: prefillEmail || "" },
  });
  const forgotForm = useForm<{ email: string }>({ defaultValues: { email: "" } });

  useEffect(() => {
    if (!isModalOpen) {
      setError("");
      setLoading(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    setError("");
  }, [modalView, authTab]);

  useEffect(() => {
    if (modalView !== "otp") {
      return;
    }

    if (resendIn <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendIn((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [modalView, resendIn]);

  const otpValue = useMemo(() => otpInputs.join(""), [otpInputs]);

  const afterAuth = useCallback(async () => {
    closeModal();
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    router.refresh();
  }, [closeModal, returnTo, router]);

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const raw = phoneInput.replace(/\D/g, "");
      const core = raw.replace(/^0/, "");
      if (!/^3\d{9}$/.test(core)) {
        throw new Error("Please enter a valid Pakistani mobile number.");
      }

      const normalized = `0${core}`;
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not send OTP.");
      }

      setPendingPhone(normalized);
      setOtpInputs(["", "", "", "", "", ""]);
      setResendIn(60);
      setView("otp");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await signIn("phone-otp", {
        redirect: false,
        phone: pendingPhone,
        otp: otpValue,
      });

      if (!result || result.error) {
        throw new Error(result?.error || "OTP verification failed");
      }

      await afterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }, [afterAuth, otpValue, pendingPhone]);

  useEffect(() => {
    if (modalView === "otp" && otpValue.length === 6) {
      void verifyOtp();
    }
  }, [modalView, otpValue, verifyOtp]);

  const handleEmailLogin = loginForm.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email-password", {
        redirect: false,
        identifier: values.identifier,
        password: values.password,
      });

      if (!result || result.error) {
        throw new Error("Invalid email or password. Try again.");
      }

      await afterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not create account");
      }

      setSuccessMode("register");
      setView("reset-success");
      window.setTimeout(() => setView("login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  });

  const handleForgotPassword = forgotForm.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSuccessMode("reset");
      setView("reset-success");
    } catch {
      setSuccessMode("reset");
      setView("reset-success");
    } finally {
      setLoading(false);
    }
  });

  const Strength = registerForm.watch("password") ?? "";
  const strength = Strength.length < 8 ? 25 : /[A-Z]/.test(Strength) && /[0-9]/.test(Strength) ? 100 : 60;

  return (
    <AnimatePresence>
      {isModalOpen ? (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close auth modal"
          />

          <div className="relative mx-auto flex min-h-screen items-center justify-center p-0 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease }}
              className="relative h-[100dvh] w-full overflow-hidden border border-gold/20 bg-cream shadow-2xl sm:h-auto sm:max-w-3xl sm:rounded-2xl"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/20 text-charcoal"
                aria-label="Close"
              >
                ×
              </button>

              <div className="grid md:grid-cols-[38%_1fr]">
                <aside className="hidden bg-charcoal p-6 text-cream md:block">
                  <div className="flex h-full flex-col justify-center space-y-4">
                    <p className="font-playfair text-3xl tracking-[0.2em]">ZARVAYA</p>
                    <p className="text-xs tracking-[0.35em] text-gold">JEWELS</p>
                    <div className="h-px w-20 bg-gold" />
                    <p className="font-playfair text-sm italic text-cream/80">Adorn yourself with pure elegance</p>
                    <div className="space-y-2 pt-2 text-xs">
                      <p className="rounded-full border border-white/30 px-3 py-1">✓ Exclusive Offers</p>
                      <p className="rounded-full border border-white/30 px-3 py-1">✓ Order Tracking</p>
                      <p className="rounded-full border border-white/30 px-3 py-1">✓ Saved Addresses</p>
                    </div>
                  </div>
                </aside>

                <section className="p-5 pt-14 sm:p-6 sm:pt-6">
                  <div className="mb-3 md:hidden">
                    <p className="font-playfair text-xl tracking-[0.18em] text-gold">ZARVAYA</p>
                    <p className="text-[10px] tracking-[0.35em] text-charcoal/70">JEWELS</p>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={modalView}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {modalView === "welcome" ? (
                        <div className="space-y-4 pt-2 text-center">
                          <h2 className="font-playfair text-3xl text-charcoal">Welcome to ZARVAYA JEWELS</h2>
                          <p className="text-sm text-charcoal/70">Join thousands of women who shop Pakistan&apos;s most loved jewellery.</p>
                          <button type="button" onClick={() => void signIn("google", { callbackUrl: returnTo || "/" })} className="h-12 w-full rounded-xl border border-charcoal/20 bg-white text-sm">
                            Continue with Google
                          </button>
                          <button type="button" onClick={() => setView("login")} className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">
                            Sign In with Email
                          </button>
                          <button type="button" onClick={() => setView("register")} className="h-12 w-full rounded-xl border border-charcoal/30 text-sm">
                            Create Account
                          </button>
                          <button type="button" onClick={closeModal} className="text-xs text-charcoal/55 underline-offset-4 hover:underline">
                            Continue browsing
                          </button>
                        </div>
                      ) : null}

                      {modalView === "login" ? (
                        <div className="space-y-4">
                          <h3 className="font-playfair text-3xl text-charcoal">Welcome back</h3>
                          <p className="text-sm text-charcoal/70">Sign in to your ZARVAYA account</p>

                          <div className="grid grid-cols-2 rounded-xl border border-stone-300 p-1">
                            <button type="button" onClick={() => setAuthTab("email")} className={`h-10 rounded-lg text-sm ${authTab === "email" ? "bg-charcoal text-cream" : "text-charcoal"}`}>
                              Email
                            </button>
                            <button type="button" onClick={() => setAuthTab("phone")} className={`h-10 rounded-lg text-sm ${authTab === "phone" ? "bg-charcoal text-cream" : "text-charcoal"}`}>
                              Phone
                            </button>
                          </div>

                          {authTab === "email" ? (
                            <form className="space-y-3" onSubmit={handleEmailLogin}>
                              <button type="button" onClick={() => void signIn("google", { callbackUrl: returnTo || "/" })} className="h-12 w-full rounded-xl border border-charcoal/20 bg-white text-sm">
                                Continue with Google
                              </button>
                              <p className="text-center text-xs text-charcoal/55">or continue with email</p>
                              <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Email or Phone" {...loginForm.register("identifier")} />
                              {loginForm.formState.errors.identifier ? <p className="text-xs text-red-600">{loginForm.formState.errors.identifier.message}</p> : null}
                              <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Password" type="password" {...loginForm.register("password")} />
                              {loginForm.formState.errors.password ? <p className="text-xs text-red-600">{loginForm.formState.errors.password.message}</p> : null}
                              <button type="button" onClick={() => setView("forgot-password")} className="text-xs text-gold-dark">Forgot password?</button>
                              {error ? <p className="text-xs text-red-600">{error}</p> : null}
                              <button disabled={loading} className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream" type="submit">
                                {loading ? "Signing in..." : "Sign In"}
                              </button>
                              <p className="text-xs text-charcoal/70">
                                New to ZARVAYA?{" "}
                                <button type="button" className="text-gold-dark" onClick={() => setView("register")}>Create account</button>
                              </p>
                            </form>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex h-12 items-center overflow-hidden rounded-xl border border-stone-300">
                                <span className="inline-flex h-full items-center border-r border-stone-300 px-3 text-sm">+92</span>
                                <input
                                  value={phoneInput}
                                  onChange={(event) => setPhoneInput(event.target.value.replace(/\D/g, "").replace(/^0/, ""))}
                                  className="h-full flex-1 bg-white px-3 text-sm outline-none"
                                  placeholder="3XX XXXXXXX"
                                />
                              </div>
                              <p className="text-xs text-charcoal/60">We&apos;ll send a 6-digit OTP to this number</p>
                              {error ? <p className="text-xs text-red-600">{error}</p> : null}
                              <button type="button" disabled={loading} onClick={() => void sendOtp()} className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">
                                {loading ? "Sending..." : "Send OTP"}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {modalView === "otp" ? (
                        <div className="space-y-4">
                          <button type="button" onClick={() => setView("login")} className="text-xs text-charcoal/70">← Back</button>
                          <h3 className="font-playfair text-3xl text-charcoal">Verify your number</h3>
                          <p className="text-sm text-charcoal/70">Enter the 6-digit code sent to <span className="font-semibold text-gold-dark">+92 {pendingPhone.slice(1)}</span></p>

                          <div className="grid grid-cols-6 gap-2">
                            {otpInputs.map((digit, index) => (
                              <input
                                key={index}
                                ref={(el) => {
                                  otpRefs.current[index] = el;
                                }}
                                value={digit}
                                onChange={(event) => {
                                  const next = event.target.value.replace(/\D/g, "").slice(-1);
                                  const updated = [...otpInputs];
                                  updated[index] = next;
                                  setOtpInputs(updated);

                                  if (next && index < 5) {
                                    otpRefs.current[index + 1]?.focus();
                                  }
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Backspace" && !otpInputs[index] && index > 0) {
                                    otpRefs.current[index - 1]?.focus();
                                  }
                                }}
                                onPaste={(event) => {
                                  const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                                  if (pasted.length === 6) {
                                    event.preventDefault();
                                    setOtpInputs(pasted.split(""));
                                    otpRefs.current[5]?.focus();
                                  }
                                }}
                                id={`otp-${index}`}
                                className="h-14 w-full rounded-lg border border-charcoal/30 bg-white text-center text-lg"
                                inputMode="numeric"
                                maxLength={1}
                              />
                            ))}
                          </div>

                          {error ? <p className="text-xs text-red-600">{error}</p> : null}

                          {resendIn > 0 ? (
                            <p className="text-xs text-charcoal/70">Resend OTP in 0:{String(resendIn).padStart(2, "0")}</p>
                          ) : (
                            <button type="button" className="text-xs text-gold-dark" onClick={() => void sendOtp()}>
                              Didn&apos;t receive it? Resend OTP
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={otpValue.length !== 6 || loading}
                            onClick={() => void verifyOtp()}
                            className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream disabled:opacity-60"
                          >
                            {loading ? "Verifying..." : "Verify & Sign In"}
                          </button>
                        </div>
                      ) : null}

                      {modalView === "register" ? (
                        <form className="space-y-3" onSubmit={handleRegister}>
                          <button type="button" onClick={() => setView("welcome")} className="text-xs text-charcoal/70">← Back</button>
                          <h3 className="font-playfair text-3xl text-charcoal">Create your account</h3>
                          <p className="text-sm text-charcoal/70">Start your ZARVAYA journey</p>

                          <button type="button" onClick={() => void signIn("google", { callbackUrl: returnTo || "/" })} className="h-12 w-full rounded-xl border border-charcoal/20 bg-white text-sm">
                            Continue with Google
                          </button>
                          <p className="text-center text-xs text-charcoal/55">or register with email</p>

                          <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Your full name" {...registerForm.register("name")} />
                          {registerForm.formState.errors.name ? <p className="text-xs text-red-600">{registerForm.formState.errors.name.message}</p> : null}
                          <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Email" {...registerForm.register("email")} />
                          {registerForm.formState.errors.email ? <p className="text-xs text-red-600">{registerForm.formState.errors.email.message}</p> : null}
                          <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Password" type="password" {...registerForm.register("password")} />
                          {registerForm.formState.errors.password ? (
                            <p className="text-xs text-red-600">Use 8+ chars with at least 1 uppercase letter and 1 number.</p>
                          ) : null}
                          <div className="h-2 rounded-full bg-stone-200">
                            <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${strength}%` }} />
                          </div>
                          <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Confirm Password" type="password" {...registerForm.register("confirmPassword")} />
                          {registerForm.formState.errors.confirmPassword ? <p className="text-xs text-red-600">{registerForm.formState.errors.confirmPassword.message}</p> : null}

                          {error ? <p className="text-xs text-red-600">{error}</p> : null}
                          <button disabled={loading} type="submit" className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">
                            {loading ? "Creating your account..." : "Create Account"}
                          </button>

                          <p className="text-xs text-charcoal/70">
                            Already have an account?{" "}
                            <button type="button" className="text-gold-dark" onClick={() => setView("login")}>Sign in</button>
                          </p>
                        </form>
                      ) : null}

                      {modalView === "forgot-password" ? (
                        <form className="space-y-3" onSubmit={handleForgotPassword}>
                          <button type="button" onClick={() => setView("login")} className="text-xs text-charcoal/70">← Back</button>
                          <h3 className="font-playfair text-3xl text-charcoal">Reset your password</h3>
                          <p className="text-sm text-charcoal/70">Enter your email and we&apos;ll send a reset link</p>
                          <input className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm" placeholder="Email" {...forgotForm.register("email")} />
                          <button disabled={loading} type="submit" className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">
                            {loading ? "Sending..." : "Send Reset Link"}
                          </button>
                        </form>
                      ) : null}

                      {modalView === "reset-success" ? (
                        <div className="space-y-4 text-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 text-2xl leading-[48px] text-green-700">✓</div>
                          <h3 className="font-playfair text-3xl text-charcoal">Success</h3>
                          {successMode === "register" ? (
                            <p className="text-sm text-charcoal/70">Your account has been created. You can sign in now and continue shopping.</p>
                          ) : (
                            <p className="text-sm text-charcoal/70">If this email is registered with ZARVAYA, you&apos;ll receive a reset link shortly.</p>
                          )}
                          <button type="button" onClick={() => setView("login")} className="h-12 w-full rounded-xl bg-charcoal text-sm text-cream">Back to Sign In</button>
                        </div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </section>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
