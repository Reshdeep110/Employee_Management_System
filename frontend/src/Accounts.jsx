import { useEffect, useRef, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Users,
  X,
  UserPlus,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";
import { request } from "./api";
import PasswordField from "./PasswordField";
function AccountForm({ onClose, onSaved }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await request("/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onSaved();
    } catch (e) {
      setError(Object.values(e.fields || {}).join(" ") || e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="account-title"
    >
      <form onSubmit={submit}>
        <div className="modal-heading">
          <div className="modal-icon">
            <UserPlus />
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <h2 id="account-title">Create an account</h2>
        <p className="muted">
          Give a team member access to your PeopleFlow workspace.
        </p>
        {error && (
          <div role="alert" className="form-error">
            {error}
          </div>
        )}
        <div className="form-grid">
          <label>
            Full name
            <input
              name="name"
              required
              maxLength={100}
              autoFocus
              autoComplete="off"
            />
          </label>
          <label>
            Work email
            <input
              name="email"
              required
              type="email"
              maxLength={160}
              autoComplete="off"
            />
          </label>
          <label>
            Access role
            <select name="role" defaultValue="STAFF">
              <option value="STAFF">Staff — view employees</option>
              <option value="ADMIN">Admin — manage workspace</option>
            </select>
          </label>
          <PasswordField
            label="Initial password"
            minLength={12}
            autoComplete="new-password"
          />
        </div>
        <p className="muted account-help">
          Use at least 12 characters (maximum 72 UTF-8 bytes). Share credentials
          privately; the password cannot be viewed after saving. The user can
          change it after signing in.
        </p>
        <div className="modal-footer">
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
export function PasswordDialog({ onClose, onChanged }) {
  const dialog = useRef(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("newPassword") !== f.get("confirm")) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await request("/auth/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: f.get("currentPassword"),
          newPassword: f.get("newPassword"),
        }),
      });
      onChanged();
    } catch (e) {
      setError(Object.values(e.fields || {}).join(" ") || e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="password-title"
    >
      <form onSubmit={submit}>
        <div className="modal-heading">
          <div className="modal-icon">
            <LockKeyhole />
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        <h2 id="password-title">Change password</h2>
        <p className="muted">
          All your existing sessions will end after this change.
        </p>
        {error && (
          <div role="alert" className="form-error">
            {error}
          </div>
        )}
        <div className="password-stack">
          <PasswordField name="currentPassword" label="Current password" />
          <PasswordField
            name="newPassword"
            label="New password (12+ characters)"
            minLength={12}
            autoComplete="new-password"
          />
          <PasswordField
            name="confirm"
            label="Confirm new password"
            minLength={12}
            autoComplete="new-password"
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="button secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
export default function Accounts({ user }) {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [pending, setPending] = useState(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [resetting, setResetting] = useState(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await request("/admin/users"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const updated = await request(`/admin/users/${pending.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !pending.enabled }),
      });
      setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setNotice(`Account ${updated.enabled ? "activated" : "deactivated"}.`);
      setPending(null);
    } catch (e) {
      setError(e.message);
      setPending(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="account-summary">
        <div>
          <ShieldCheck size={25} />
          <span>
            <strong>Access you can control</strong>
            <small>
              Admins manage the workspace. Staff can view employee records.
            </small>
          </span>
        </div>
        <button className="button primary" onClick={() => setShow(true)}>
          <Plus size={17} />
          Create account
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="auth-notice" role="status">
          {notice}
        </div>
      )}
      <section className="directory">
        <div className="directory-top">
          <strong>
            Workspace accounts{" "}
            <span className="account-total">{rows.length}</span>
          </strong>
          <button
            className="icon-button"
            onClick={load}
            aria-label="Refresh accounts"
            disabled={loading}
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>TEAM MEMBER</th>
                <th>ACCESS ROLE</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="person">
                      <div className="avatar">
                        {u.name
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <strong>
                          {u.name}
                          {u.id === user.id ? " (You)" : ""}
                        </strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={"role-tag " + u.role.toLowerCase()}>
                      {u.role === "ADMIN" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <Users size={14} />
                      )}{" "}
                      {u.role === "ADMIN" ? "Administrator" : "Staff"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={"badge " + (u.enabled ? "active" : "inactive")}
                    >
                      {u.enabled ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        title="Reset password"
                        aria-label={`Reset password for ${u.name}`}
                        disabled={u.id === user.id}
                        onClick={() => setResetting(u)}
                      >
                        <LockKeyhole size={16} />
                      </button>
                      <button
                        className="button secondary"
                        disabled={u.id === user.id}
                        onClick={() => setPending(u)}
                      >
                        {u.enabled ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="empty-state">Loading accounts…</div>}
      </section>
      {pending && (
        <ConfirmStatus
          account={pending}
          busy={busy}
          onClose={() => setPending(null)}
          onConfirm={toggle}
        />
      )}{" "}
      {resetting && (
        <ResetPassword
          account={resetting}
          onClose={() => setResetting(null)}
          onSaved={() => {
            setResetting(null);
            setNotice(
              "Password reset. Share the new credentials privately. Existing sessions will end.",
            );
          }}
        />
      )}{" "}
      {show && (
        <AccountForm
          onClose={() => setShow(false)}
          onSaved={() => {
            setShow(false);
            setNotice(
              "Account created. Share the credentials privately with the user.",
            );
            load();
          }}
        />
      )}
    </>
  );
}
function ConfirmStatus({ account, busy, onClose, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="status-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="delete-content">
        <h2 id="status-title">
          {account.enabled ? "Deactivate" : "Activate"} {account.name}?
        </h2>
        <p className="muted">
          {account.enabled
            ? "Their existing sessions will end on their next request. They will no longer be able to sign in."
            : "This user will be able to sign in again."}
        </p>
        <div className="modal-footer">
          <button
            className="button secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="button primary"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Updating…" : "Confirm"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function ResetPassword({ account, onClose, onSaved }) {
  const ref = useRef(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await request(`/admin/users/${account.id}/password`, {
        method: "POST",
        body: JSON.stringify({ password: f.get("password") }),
      });
      onSaved();
    } catch (e) {
      setError(Object.values(e.fields || {}).join(" ") || e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={ref}
      aria-labelledby="reset-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <h2 id="reset-title">Reset password</h2>
        <p className="muted">
          Set a new password for {account.name}. Their existing sessions will
          end.
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <PasswordField
          label="New password (12+ characters)"
          minLength={12}
          autoComplete="new-password"
        />
        <div className="modal-footer">
          <button
            className="button secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? "Resetting…" : "Reset password"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
