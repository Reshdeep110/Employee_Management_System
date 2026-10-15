import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Users,
  Check,
  Mail,
  RefreshCw,
} from "lucide-react";
import App from "./App";
import PasswordField from "./PasswordField";
import Brand from "./Brand";
import { request, clearCsrf } from "./api";
export default function AuthApp() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function check() {
    setChecking(true);
    setError("");
    try {
      setUser(await request("/auth/me"));
    } catch (e) {
      if (e.status !== 401) setError(e.message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    check();
    const expired = () => {
      setUser(null);
      clearCsrf();
      setNotice("Your session has ended. Please sign in again.");
    };
    window.addEventListener("peopleflow:expired", expired);
    return () => window.removeEventListener("peopleflow:expired", expired);
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const data = new FormData(e.currentTarget);
    try {
      await request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: data.get("email").trim(),
          password: data.get("password"),
        }).toString(),
      });
      clearCsrf();
      setUser(await request("/auth/me"));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await request("/auth/logout", { method: "POST" });
    clearCsrf();
    setUser(null);
    setNotice("You have been signed out.");
  }
  function changed() {
    clearCsrf();
    setUser(null);
    setNotice("Password updated. Sign in with your new password.");
  }
  if (checking)
    return (
      <div className="auth-loading">
        <Brand />
        <RefreshCw className="spin" />
        <p>Opening your workspace…</p>
      </div>
    );
  if (user)
    return <App user={user} onLogout={logout} onPasswordChanged={changed} />;
  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="story-brand">
          <Users size={25} />
          <span>PeopleFlow</span>
        </div>
        <div className="story-content">
          <span className="story-kicker">PEOPLE FIRST. ALWAYS.</span>
          <h1>
            Good teams.
            <br />
            Great possibilities.
          </h1>
          <p>
            A thoughtful workspace for the people who make your organisation
            move forward.
          </p>
          <div className="story-preview">
            <div className="preview-title">
              <span className="preview-dot" />
              One connected workspace
              <ShieldCheck size={20} />
            </div>
            <div className="preview-people">
              {["RM", "AK", "PS", "JD"].map((x, i) => (
                <span key={x} className={"preview-avatar pa-" + i}>
                  {x}
                </span>
              ))}
              <span className="preview-caption">
                Your people,
                <br />
                <strong>working together.</strong>
              </span>
            </div>
            <div className="preview-features">
              <span>
                <Check size={15} />
                Employee directory
              </span>
              <span>
                <Check size={15} />
                Team insights
              </span>
              <span>
                <Check size={15} />
                Role-based access
              </span>
            </div>
          </div>
        </div>
        <div className="story-footer">
          <ShieldCheck size={16} />
          Access managed by your administrator
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-top">
          <Brand />
          <span className="private-label">
            <LockKeyhole size={13} />
            Private workspace
          </span>
        </div>
        <div className="login-card">
          <div className="login-icon">
            <LockKeyhole size={25} />
          </div>
          <div className="eyebrow">WELCOME TO YOUR WORKSPACE</div>
          <h2>Welcome back.</h2>
          <p className="login-intro">
            Sign in to connect with your team and keep everything moving.
          </p>
          {notice && (
            <div role="status" className="auth-notice">
              {notice}
            </div>
          )}
          {error && (
            <div role="alert" className="form-error">
              {error}
            </div>
          )}
          <form onSubmit={login}>
            <label>
              Work email
              <span className="email-field">
                <Mail size={18} />
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  required
                  maxLength={160}
                />
              </span>
            </label>
            <PasswordField />
            <div className="login-hint">
              <ShieldCheck size={14} />
              Use the account provided by your administrator.
            </div>
            <button className="button primary login-submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in to workspace"}
              {busy ? (
                <RefreshCw size={18} className="spin" />
              ) : (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
          <div className="access-note">
            <strong>Need access or forgot your password?</strong>
            <p>
              Contact your workspace administrator. Public registration is
              disabled.
            </p>
          </div>
        </div>
        <footer className="auth-footer">
          PeopleFlow <span>People, connected.</span>
        </footer>
      </section>
    </div>
  );
}
