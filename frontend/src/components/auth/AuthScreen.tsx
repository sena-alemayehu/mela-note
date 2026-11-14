"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import LanguageSwitcher from "../language/LanguageSwitcher";
import { useLanguage } from "../language/LanguageProvider";
import "../../styles/auth.css";

type AuthScreenProps = {
  mode: "signup" | "login";
};

type Language = "en" | "am";

type AuthResponse = {
  accessToken?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  message?: string | string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const copy = {
  en: {
    welcome: "Welcome to",
    tagline: "Your notes, your space.",
    loginHeading: "Sign in to continue",
    signupHeading: "Create your account",
    signup: "Sign up",
    name: "Full name",
    email: "Email",
    password: "Password",
    namePlaceholder: "Your full name",
    emailPlaceholder: "hello@example.com",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgot: "Forgot Password?",
    already: "Already have an account?",
    noAccount: "Don't have an account?",
    signIn: "Sign in",
    next: "Create account",
    submitLogin: "Login",
    required: "Please complete all required fields.",
    invalidEmail: "Please enter a valid email address.",
    shortPassword: "Password must contain at least 8 characters.",
    submitting: "Please wait...",
    signupSuccess: "Account created successfully. Please log in.",
    genericError: "Something went wrong. Please try again.",
  },

  am: {
    welcome: "እንኳን ወደ",
    tagline: "ማስታወሻዎ፣ የእርስዎ ቦታ።",
    loginHeading: "ለመቀጠል ይግቡ",
    signupHeading: "መለያ ይፍጠሩ",
    signup: "መለያ ይፍጠሩ",
    name: "ሙሉ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    namePlaceholder: "ሙሉ ስምዎን ያስገቡ",
    emailPlaceholder: "hello@example.com",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    showPassword: "የይለፍ ቃል አሳይ",
    hidePassword: "የይለፍ ቃል ደብቅ",
    forgot: "የይለፍ ቃል ረሱ?",
    already: "መለያ አለዎት?",
    noAccount: "መለያ የለዎትም?",
    signIn: "ይግቡ",
    next: "መለያ ይፍጠሩ",
    submitLogin: "ግባ",
    required: "እባክዎ አስፈላጊ መረጃዎችን ያስገቡ።",
    invalidEmail: "ትክክለኛ ኢሜይል ያስገቡ።",
    shortPassword: "የይለፍ ቃሉ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል።",
    submitting: "እባክዎ ይጠብቁ...",
    signupSuccess: "መለያዎ ተፈጥሯል። እባክዎ ይግቡ።",
    genericError: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
  },
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const { language } = useLanguage();
  const t = copy[language as Language] ?? copy.en;

  const isSignup = mode === "signup";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (isSubmitting) return;

    // Required fields validation
    if ((isSignup && !name.trim()) || !email.trim() || !password) {
      setMessage(t.required);
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage(t.invalidEmail);
      return;
    }

    // Password validation
    if (password.length < 8) {
      setMessage(t.shortPassword);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isSignup
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`;

      const requestBody = isSignup
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include", // Accepts secure HttpOnly cookies (Task 1)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result: AuthResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const backendMessage = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message;

        throw new Error(backendMessage || t.genericError);
      }

      // Signup successful
      if (isSignup) {
        setMessage(t.signupSuccess);
        router.push("/login");
        return;
      }

      // Check that login returned an access token
      if (!result.accessToken) {
        throw new Error(
          "The backend did not return an access token."
        );
      }

      // Save authentication token
      localStorage.setItem(
        "mela-note-access-token",
        result.accessToken
      );

      // Save user information if returned by the backend
      if (result.user) {
        localStorage.setItem(
          "mela-note-user",
          JSON.stringify(result.user)
        );
      }

      // Go to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : t.genericError
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-scene" lang={language}>
      <div className="sky-decoration sky-cloud-one" aria-hidden="true" />
      <div className="sky-decoration sky-cloud-two" aria-hidden="true" />
      <div className="sky-decoration sky-cloud-three" aria-hidden="true" />

      <div className="paper-plane" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <path d="M8 42 L92 8 L65 91 L48 57 Z" fill="#7890ff" />
          <path d="M8 42 L48 57 L92 8 Z" fill="#a1b3ff" />
          <path d="M48 57 L65 91 L70 43 Z" fill="#6479ed" />
        </svg>
      </div>

      <section
        className={`auth-card ${isSignup ? "signup-card" : "login-card"}`}
      >
        <aside className="auth-welcome">
          <div className="welcome-content">
            <p className="welcome-eyebrow">{t.welcome}</p>

            <Link
              href="/"
              className="welcome-logo"
              aria-label="Mela Note home"
            >
              <span>Mela</span> <strong>Note</strong>
            </Link>

            <p className="welcome-tagline">{t.tagline}</p>

            <div
              className="welcome-app-icon"
              aria-label="Mela Note notebook icon"
            >
              <div className="icon-tabs">
                <i />
                <i />
                <i />
              </div>

              <div className="icon-paper">
                <div />
                <div />
                <div />
              </div>

              <span className="icon-pencil">✎</span>
            </div>
          </div>

          <div className="welcome-clouds" aria-hidden="true" />
        </aside>

        <div className="auth-form-panel">
          <div className="auth-topbar">
            <span className="auth-topbar-dot" aria-hidden="true" />
            <LanguageSwitcher />
          </div>

          <div className="auth-form-content">
            <h1>{isSignup ? t.signupHeading : t.loginHeading}</h1>

            <form onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <label className="auth-input-group">
                  <span>{t.name}</span>

                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>
              )}

              <label className="auth-input-group">
                <span>{t.email}</span>

                <div className="auth-input-shell">
                  <span className="input-symbol" aria-hidden="true">
                    <Mail size={17} strokeWidth={1.8} />
                  </span>

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="auth-input-group">
                <span>{t.password}</span>

                <div className="auth-input-shell">
                  <span className="input-symbol" aria-hidden="true">
                    <Lock size={17} strokeWidth={1.8} />
                  </span>

                  <input
                    className="auth-password-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    onMouseDown={(event) => event.preventDefault()}
                    aria-label={
                      showPassword ? t.hidePassword : t.showPassword
                    }
                    aria-pressed={showPassword}
                    title={
                      showPassword ? t.hidePassword : t.showPassword
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </label>

              {message && (
                <p className="auth-feedback" role="alert">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t.submitting
                  : isSignup
                    ? t.next
                    : t.submitLogin}

                <span aria-hidden="true">→</span>
              </button>
            </form>

            {!isSignup && (
              <Link href="/forgot-password" className="auth-forgot">
                {t.forgot}
              </Link>
            )}

            <p className="auth-account-switch">
              {isSignup ? t.already : t.noAccount}

              <Link href={isSignup ? "/login" : "/signup"}>
                {isSignup ? t.signIn : t.signup}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <p className="sky-footer">
        A little space for every thought ✦
      </p>
    </main>
  );
}