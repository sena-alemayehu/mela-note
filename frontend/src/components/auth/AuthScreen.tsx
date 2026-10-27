
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import LanguageSwitcher from "../language/LanguageSwitcher";
import { useLanguage } from "../language/LanguageProvider";
import "../../styles/auth.css";
import router from "next/dist/shared/lib/router/router";

type AuthScreenProps = {
  mode: "signup" | "login";
};

const copy = {
  en: {
    welcome: "Welcome to",
    tagline: "Your notes, your space.",
    loginHeading: "Sign in to continue",
    signupHeading: "Create your account",
    signup: "Sign up",
    login: "Login",
    name: "Full name",
    email: "Email",
    password: "Password",
    namePlaceholder: "Your full name",
    emailPlaceholder: "hello@example.com",
    passwordPlaceholder: "Enter your password",
    forgot: "Forgot Password?",
    already: "Already have an account?",
    noAccount: "Don't have an account?",
    signIn: "Sign in",
    next: "Create account",
    submitLogin: "Login",
    required: "Please complete all required fields.",
    invalidEmail: "Please enter a valid email address.",
    shortPassword: "Password must contain at least 8 characters.",
    demo: "The form is ready. Authentication still needs to be connected to the backend.",
  },
  am: {
    welcome: "እንኳን ወደ",
    tagline: "ማስታወሻዎ፣ የእርስዎ ቦታ።",
    loginHeading: "ለመቀጠል ይግቡ",
    signupHeading: "መለያ ይፍጠሩ",
    signup: "መለያ ይፍጠሩ",
    login: "ግባ",
    name: "ሙሉ ስም",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    namePlaceholder: "ሙሉ ስምዎን ያስገቡ",
    emailPlaceholder: "hello@example.com",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    forgot: "የይለፍ ቃል ረሱ?",
    already: "መለያ አለዎት?",
    noAccount: "መለያ የለዎትም?",
    signIn: "ይግቡ",
    next: "መለያ ይፍጠሩ",
    submitLogin: "ግባ",
    required: "እባክዎ አስፈላጊ መረጃዎችን ያስገቡ።",
    invalidEmail: "ትክክለኛ ኢሜይል ያስገቡ።",
    shortPassword: "የይለፍ ቃሉ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል።",
    demo: "ቅጹ ዝግጁ ነው። ከጀርባ አገልጋዩ ጋር በሚቀጥለው ደረጃ እናገናኘዋለን።",
  },
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const { language } = useLanguage();
  const t = copy[language];
  const isSignup = mode === "signup";

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setMessage("");

  if ((isSignup && !name.trim()) || !email.trim() || !password) {
    setMessage(t.required);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMessage(t.invalidEmail);
    return;
  }

  if (password.length < 8) {
    setMessage(t.shortPassword);
    return;
  }

  if (isSignup) {
    sessionStorage.setItem(
      "mela-note-demo-account",
      JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      })
    );

    router.push("/login");
    return;
  }

  const savedAccount = sessionStorage.getItem("mela-note-demo-account");

  if (!savedAccount) {
    setMessage(
      language === "am"
        ? "እባክዎ መጀመሪያ መለያ ይፍጠሩ።"
        : "Please create an account first."
    );
    return;
  }

  const account = JSON.parse(savedAccount);

  if (email.trim().toLowerCase() !== account.email) {
    setMessage(
      language === "am"
        ? "ያስገቡት ኢሜይል አይዛመድም።"
        : "The email does not match the demo account."
    );
    return;
  }

  
  sessionStorage.setItem("mela-note-demo-authenticated", "true");

  router.push("/dashboard");
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

      <section className={`auth-card ${isSignup ? "signup-card" : "login-card"}`}>
        <aside className="auth-welcome">
          <div className="welcome-content">
            <p className="welcome-eyebrow">{t.welcome}</p>
            <Link href="/" className="welcome-logo" aria-label="Mela Note home">
              <span>Mela</span> <strong>Note</strong>
            </Link>
            <p className="welcome-tagline">{t.tagline}</p>

            <div className="welcome-app-icon" aria-label="Mela Note notebook icon">
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
                  <span className="input-symbol" aria-hidden="true">✉</span>
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
                  <span className="input-symbol" aria-hidden="true">♙</span>
                  <input
                    type="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </label>

              {message && (
                <p className="auth-feedback" role="status">
                  {message}
                </p>
              )}

              <button type="submit" className="auth-primary-button">
                {isSignup ? t.next : t.submitLogin}
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

      <p className="sky-footer">A little space for every thought ✦</p>
    </main>
  );
}
