'use client';

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles, Eye, EyeOff, Github, Phone, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [view, setView] = useState<'signup' | 'login'>('login');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // Check URL params on client side
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'signup') {
            setView('signup');
        }
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!otpSent) {
                const { error } = await supabase.auth.signInWithOtp({
                    phone: phoneNumber,
                });
                if (error) throw error;
                setOtpSent(true);
                setMessage({ type: 'success', text: "OTP sent! Please check your messages." });
            } else {
                const { data, error } = await supabase.auth.verifyOtp({
                    phone: phoneNumber,
                    token: otp,
                    type: 'sms',
                });
                if (error) throw error;

                if (data.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, campus_id')
                        .eq('id', data.user.id)
                        .single();

                    if (!profile) {
                        // Create profile for new phone user
                        await supabase.from('profiles').insert({
                            id: data.user.id,
                            full_name: 'User',
                            email_verified: true // Phone users are verified by SMS
                        });
                        router.push('/onboarding');
                    } else if (profile.campus_id) {
                        router.push('/browse');
                    } else {
                        router.push('/onboarding');
                    }
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (view === 'signup') {
                // Signup flow
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;

                // Create profile entry (email_verified will be added later)
                // Create profile entry immediately
                if (data.user) {
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        full_name: fullName,
                    }, {
                        onConflict: 'id'
                    });

                    if (data.session) {
                        setMessage({ type: 'success', text: "Account verified! Jumping into the Loop..." });
                        setTimeout(() => router.push('/onboarding'), 1500);
                    } else {
                        setMessage({
                            type: 'success',
                            text: "Almost there! Check your email to verify your status, then you're in."
                        });
                        setTimeout(() => setView('login'), 4000);
                    }
                }
            } else {
                // Login flow
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Check if user has completed onboarding
                if (data.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('campus_id')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.campus_id) {
                        setMessage({ type: 'success', text: "Welcome back! Redirecting..." });
                        setTimeout(() => router.push('/browse'), 1500);
                    } else {
                        setMessage({ type: 'success', text: "Welcome! Completing your profile..." });
                        setTimeout(() => router.push('/onboarding'), 1500);
                    }
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-loops-primary/10 via-transparent to-transparent pointer-events-none" />

            <Navbar />

            <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-loops-border bg-white p-10 shadow-2xl shadow-loops-primary/10 transition-all duration-500 hover:shadow-loops-primary/20">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-loops-primary/5 border border-loops-primary/20 flex items-center justify-center text-loops-primary mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Sparkles className="w-8 h-8 filter drop-shadow-sm" />
                        </div>
                        <p className="text-sm font-bold text-loops-primary uppercase tracking-widest leading-none">Nigerian Campus Network</p>
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter italic text-loops-main">
                            {view === 'signup' ? "Join the Loop." : "Welcome back."}
                        </h1>
                        <p className="text-loops-muted text-sm font-medium pt-2">
                            {view === 'signup'
                                ? "Create your account to start trading."
                                : "Sign in to access your dashboard."}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-loops-border bg-loops-subtle/50 hover:bg-loops-subtle text-loops-main font-bold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </Button>
                        <Button
                            onClick={() => {
                                setAuthMethod(authMethod === 'email' ? 'phone' : 'email');
                                setMessage(null);
                                setOtpSent(false);
                            }}
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-loops-border bg-loops-subtle/50 hover:bg-loops-subtle text-loops-main font-bold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            {authMethod === 'email' ? (
                                <>
                                    <Phone className="w-5 h-5 text-loops-primary" />
                                    Continue with Phone
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5 text-loops-primary" />
                                    Return to Email Login
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-loops-border opacity-50"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted">Or</span>
                        </div>
                    </div>

                    {authMethod === 'email' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {view === 'signup' && (
                                <div className="space-y-3">
                                    <label htmlFor="fullName" className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-loops-primary/30" />
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="w-full h-16 rounded-2xl bg-loops-subtle border border-loops-border px-8 text-loops-main placeholder:text-loops-muted/40 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-loops-primary/30" />
                                    {view === 'signup' ? 'University Email' : 'Email'}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@university.edu"
                                    required
                                    className="w-full h-16 rounded-2xl bg-loops-subtle border border-loops-border px-8 text-loops-main placeholder:text-loops-muted/40 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-loops-primary/30" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full h-16 rounded-2xl bg-loops-subtle border border-loops-border px-8 pr-14 text-loops-main placeholder:text-loops-muted/40 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-loops-muted hover:text-loops-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "text-[10px] font-bold p-5 rounded-2xl border uppercase tracking-[0.1em] shadow-sm italic",
                                        message.type === 'success'
                                            ? "bg-loops-success/5 border-loops-success/20 text-loops-success"
                                            : "bg-red-50 border-red-100 text-red-500"
                                    )}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 text-lg font-bold bg-loops-primary hover:bg-loops-primary/90 text-white rounded-2xl shadow-xl shadow-loops-primary/20 transition-all border-none hover:scale-[1.02] active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                        {view === 'signup' ? 'Creating Account...' : 'Signing In...'}
                                    </>
                                ) : (
                                    view === 'signup' ? "Create Account" : "Sign In"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handlePhoneLogin} className="space-y-6">
                            <div className="space-y-3">
                                <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-loops-primary/30" />
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+234..."
                                    required
                                    disabled={otpSent}
                                    className="w-full h-16 rounded-2xl bg-loops-subtle border border-loops-border px-8 text-loops-main placeholder:text-loops-muted/40 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
                                />
                            </div>

                            {otpSent && (
                                <div className="space-y-3">
                                    <label htmlFor="otp" className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-loops-primary/30" />
                                        Enter OTP
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        required
                                        className="w-full h-16 rounded-2xl bg-loops-subtle border border-loops-border px-8 text-loops-main placeholder:text-loops-muted/40 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
                                    />
                                </div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "text-[10px] font-bold p-5 rounded-2xl border uppercase tracking-[0.1em] shadow-sm italic",
                                        message.type === 'success'
                                            ? "bg-loops-success/5 border-loops-success/20 text-loops-success"
                                            : "bg-red-50 border-red-100 text-red-500"
                                    )}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 text-lg font-bold bg-loops-primary hover:bg-loops-primary/90 text-white rounded-2xl shadow-xl shadow-loops-primary/20 transition-all border-none hover:scale-[1.02] active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                        {otpSent ? 'Verifying...' : 'Sending OTP...'}
                                    </>
                                ) : (
                                    otpSent ? "Verify OTP" : "Send OTP"
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="text-center space-y-6 pt-4 border-t border-loops-border">
                        <p className="text-sm text-loops-muted">
                            {view === 'signup' ? (
                                <>
                                    Already have an account?{' '}
                                    <a href="/login" className="text-loops-primary font-bold hover:underline">
                                        Sign in
                                    </a>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <a href="/login?view=signup" className="text-loops-primary font-bold hover:underline">
                                        Join the Loop
                                    </a>
                                </>
                            )}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-loops-muted opacity-60 italic">
                            Secure campus networking • Verified peers only
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
