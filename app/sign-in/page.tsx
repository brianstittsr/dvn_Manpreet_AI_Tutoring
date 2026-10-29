"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { auth, reconnectFirestore } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { findAndLinkTeamMember } from "@/lib/auth-team-member-link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("svp_remembered_email");
    const savedRememberMe = localStorage.getItem("svp_remember_me") === "true";
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Save or clear remembered credentials
      if (rememberMe) {
        localStorage.setItem("svp_remembered_email", email);
        localStorage.setItem("svp_remember_me", "true");
      } else {
        localStorage.removeItem("svp_remembered_email");
        localStorage.removeItem("svp_remember_me");
      }

      if (!email || !password) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      let firebaseUid: string | null = null;
      let userName: string | null = null;

      // Try Firebase Auth sign-in if available
      if (auth) {
        try {
          console.log("Attempting Firebase sign-in for:", email);
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          firebaseUid = userCredential.user.uid;
          userName = userCredential.user.displayName;
          console.log("Firebase sign-in successful:", firebaseUid);

          // Team member linking is optional - do it in background without blocking sign-in
          // This prevents Firestore offline errors from blocking login
          const userEmail = email;
          const userUid = firebaseUid;
          setTimeout(async () => {
            try {
              await reconnectFirestore();
              const teamMember = await findAndLinkTeamMember(userEmail, userUid);
              if (teamMember) {
                console.log(`Linked to Team Member: ${teamMember.firstName} ${teamMember.lastName}`);
                sessionStorage.setItem("svp_team_member_id", teamMember.id);
                sessionStorage.setItem("svp_user_role", teamMember.role);
                sessionStorage.setItem("svp_user_name", `${teamMember.firstName} ${teamMember.lastName}`);
              }
            } catch (linkError) {
              console.warn("Team member linking failed (non-blocking):", linkError);
            }
          }, 100);
        } catch (authError: any) {
          console.error("Firebase Auth error:", authError.code, authError.message);
          // Handle specific Firebase Auth errors
          if (authError.code === "auth/user-not-found") {
            setError("No account found with this email. Please sign up first.");
            setIsLoading(false);
            return;
          }
          if (authError.code === "auth/wrong-password" || authError.code === "auth/invalid-credential") {
            setError("Invalid email or password. Please try again.");
            setIsLoading(false);
            return;
          }
          if (authError.code === "auth/too-many-requests") {
            setError("Too many failed attempts. Please try again later or reset your password.");
            setIsLoading(false);
            return;
          }
          if (authError.code === "auth/network-request-failed") {
            setError("Network error. Please check your connection and try again.");
            setIsLoading(false);
            return;
          }
          // For any other error, show a generic message
          setError(`Sign in failed: ${authError.message || "Please try again."}`);
          setIsLoading(false);
          return;
        }
      } else {
        console.warn("Firebase Auth not initialized - check your environment variables");
        setError("Authentication service not available. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Store session info
      sessionStorage.setItem("svp_authenticated", "true");
      sessionStorage.setItem("svp_user_email", email);
      if (firebaseUid) {
        sessionStorage.setItem("svp_firebase_uid", firebaseUid);
      }
      if (userName) {
        sessionStorage.setItem("svp_user_name", userName);
      }
      
      console.log("Sign-in complete, redirecting to portal...");
      
      // Redirect to portal - use replace to prevent back button issues
      router.replace("/portal");
      return; // Exit early to prevent finally from setting isLoading to false
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("An error occurred during sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-3 group">
            <Image
              src="/aicenter4u-logo.svg"
              alt="AICenter4U"
              width={200}
              height={67}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#C8A951] to-[#a08840] hover:from-[#b89841] hover:to-[#907830] text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0" />
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
