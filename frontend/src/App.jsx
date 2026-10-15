import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  LayoutDashboard,
  Building2,
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  UserPlus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Briefcase,
  ArrowUpDown,
  Mail,
  Database,
  Code2,
} from "lucide-react";
import { request } from "./api";
import Brand from "./Brand";
import Accounts, { PasswordDialog } from "./Accounts";
import { ShieldCheck, LogOut, KeyRound } from "lucide-react";
const labels = { ACTIVE: "Active", ON_LEAVE: "On leave", INACTIVE: "Inactive" };
const standardDepartments = [
  "Engineering",
  "Product",
  "People",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const blank = () => ({
  name: "",
  email: "",
  department: "Engineering",
  role: "",
  status: "ACTIVE",
  joinedOn: today(),
});
const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
function Badge({ status }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <i />
      {labels[status]}
    </span>
  );
}
function Form({ employee, onClose, onSave, departments }) {
  const [form, setForm] = useState(employee ? { ...employee } : blank());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFields({ ...fields, [e.target.name]: undefined });
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  }
  const field = (name, title, type = "text", maxLength) => (
    <label>
      {title}
      <input
        name={name}
        type={type}
        maxLength={maxLength}
        max={type === "date" ? today() : undefined}
        value={form[name]}
        onChange={change}
        required
        autoFocus={name === "name"}
        aria-invalid={!!fields[name]}
      />
      {fields[name] && <small className="field-error">{fields[name]}</small>}
    </label>
  );
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="form-title"
    >
      <form onSubmit={submit}>
        <div className="modal-heading">
          <div className="modal-icon">
            <UserPlus size={23} />
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close form"
            onClick={onClose}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="form-title">{employee ? "Edit employee" : "Add employee"}</h2>
        <p className="muted">
          {employee
            ? "Update this employee’s information."
            : "Create a profile and welcome someone to your team."}
        </p>
        {error && (
          <div role="alert" className="form-error">
            {error}
          </div>
        )}
        <div className="form-grid">
          {field("name", "Full name", "text", 100)}
          {field("email", "Work email", "email", 160)}
          <label>
            Department
            <select name="department" value={form.department} onChange={change}>
              {departments.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {field("role", "Job role", "text", 100)}
          <label>
            Status
            <select name="status" value={form.status} onChange={change}>
              {Object.entries(labels).map(([key, val]) => (
                <option key={key} value={key}>
                  {val}
                </option>
              ))}
            </select>
          </label>
          {field("joinedOn", "Joining date", "date")}
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
            {busy ? "Saving…" : employee ? "Save changes" : "Save employee"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
function DeleteDialog({ employee, onClose, onDelete }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      aria-labelledby="delete-title"
    >
      <div className="delete-content">
        <div className="danger-icon">
          <Trash2 />
        </div>
        <h2 id="delete-title">Delete {employee.name}?</h2>
        <p className="muted">
          This permanently removes the employee record from the database.
        </p>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button
            className="button secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onDelete(employee.id);
                onClose();
              } catch (e) {
                setError(e.message);
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete employee"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
export default function App({ user, onLogout, onPasswordChanged }) {
  const isAdmin = user.role === "ADMIN";
  const [passwordOpen, setPasswordOpen] = useState(false),
    [loggingOut, setLoggingOut] = useState(false);
  async function signOut() {
    setLoggingOut(true);
    try {
      await onLogout();
    } catch (e) {
      setToast(e.message);
      setLoggingOut(false);
    }
  }
  const [employees, setEmployees] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [mode, setMode] = useState(""),
    [view, setView] = useState("Employees"),
    [query, setQuery] = useState(""),
    [department, setDepartment] = useState("All departments"),
    [status, setStatus] = useState("All statuses"),
    [sort, setSort] = useState("recent"),
    [page, setPage] = useState(1),
    [modal, setModal] = useState(null),
    [deleting, setDeleting] = useState(null),
    [toast, setToast] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [rows, health] = await Promise.all([
        request("/employees"),
        request("/health"),
      ]);
      setEmployees(rows);
      setMode(health.databaseMode);
    } catch (e) {
      setError(e.message);
      setMode("");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const departments = useMemo(
    () =>
      [
        ...new Set([
          ...standardDepartments,
          ...employees.map((e) => e.department),
        ]),
      ].sort(),
    [employees],
  );
  const groups = useMemo(
    () => [...new Set(employees.map((e) => e.department))].sort(),
    [employees],
  );
  const filtered = useMemo(
    () =>
      employees
        .filter(
          (e) =>
            `${e.name} ${e.email} ${e.role}`
              .toLowerCase()
              .includes(query.toLowerCase().trim()) &&
            (department === "All departments" || e.department === department) &&
            (status === "All statuses" || e.status === status),
        )
        .sort((a, b) =>
          sort === "name" ? a.name.localeCompare(b.name) : b.id - a.id,
        ),
    [employees, query, department, status, sort],
  );
  const maxPage = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, maxPage);
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6);
  useEffect(() => setPage(1), [query, department, status, sort]);
  const active = employees.filter((e) => e.status === "ACTIVE").length;
  const newJoins = employees.filter((e) => {
    const age = (new Date(today()) - new Date(e.joinedOn)) / 86400000;
    return age >= 0 && age < 30;
  }).length;
  async function save(form) {
    const editing = modal.employee;
    const data = await request(
      editing ? `/employees/${editing.id}` : "/employees",
      { method: editing ? "PUT" : "POST", body: JSON.stringify(form) },
    );
    setEmployees((prev) =>
      editing
        ? prev.map((e) => (e.id === data.id ? data : e))
        : [data, ...prev],
    );
    setToast(
      editing ? "Employee updated successfully" : "Employee added successfully",
    );
    setPage(1);
  }
  async function remove(id) {
    await request(`/employees/${id}`, { method: "DELETE" });
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setToast("Employee deleted successfully");
  }
  function exportCSV() {
    const safe = (value) =>
      '"' +
      String(
        /^[=+\-@\t\r]/.test(String(value)) ? "'" + value : value,
      ).replaceAll('"', '""') +
      '"';
    const lines = [
      ["ID", "Name", "Email", "Department", "Role", "Status", "Joined on"],
      ...filtered.map((e) => [
        e.id,
        e.name,
        e.email,
        e.department,
        e.role,
        labels[e.status],
        e.joinedOn,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\ufeff" + lines.map((row) => row.map(safe).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "peopleflow-employees.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast(`Exported ${filtered.length} employees`);
  }
  const nav = [
    ["Overview", LayoutDashboard],
    ["Employees", Users],
    ["Departments", Building2],
    ...(isAdmin ? [["Accounts", ShieldCheck]] : []),
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand brand-with-image"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("Employees");
          }}
        >
          <Brand />
        </a>
        <div className="workspace">
          <span className="workspace-icon">PF</span>
          <div>
            My workspace<small>Employee management</small>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={view === name ? "nav-item selected" : "nav-item"}
              onClick={() => setView(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Employees" && (
                <span className="nav-count">{employees.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={21} />
          <strong>
            {isAdmin ? "Administrator workspace" : "Staff workspace"}
          </strong>
          <p>
            {isAdmin
              ? "Manage your team and control who has access."
              : "Browse your team directory and department insights."}
          </p>
        </div>
        <div className="profile">
          <div className="avatar profile-avatar">{initials(user.name)}</div>
          <div>
            {user.name}
            <small>{isAdmin ? "Administrator" : "Staff · Read only"}</small>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            Workspace <span>/</span> <strong>{view}</strong>
          </div>
          <div className="topbar-controls">
            <button
              className="icon-button"
              title="Change password"
              aria-label="Change password"
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound size={18} />
            </button>
            <button
              className="button secondary"
              disabled={loggingOut}
              onClick={signOut}
            >
              <LogOut size={15} />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
            <div className="connection">
              <i className={mode ? "online" : ""} />
              {mode ? "API connected" : loading ? "Connecting…" : "API offline"}
            </div>
          </div>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <div className="eyebrow">YOUR PEOPLE, IN ONE PLACE</div>
              <h1>{view}</h1>
              <p>
                {view === "Accounts"
                  ? "Manage workspace access and keep your team connected."
                  : view === "Employees"
                    ? "Manage employee profiles, roles and organisation details."
                    : view === "Overview"
                      ? "A clear picture of your team, powered by your employee records."
                      : "Explore the people behind every department."}
              </p>
            </div>
            {view !== "Accounts" && (
              <div className="heading-actions">
                <button
                  className="button secondary"
                  onClick={exportCSV}
                  disabled={loading || !!error || !filtered.length}
                >
                  <Download size={17} />
                  Export CSV
                </button>
                {isAdmin && (
                  <button
                    className="button primary"
                    onClick={() => setModal({ employee: null })}
                    disabled={loading || !!error}
                  >
                    <Plus size={18} />
                    Add employee
                  </button>
                )}
              </div>
            )}
          </section>
          {error && (
            <div role="alert" className="error-banner">
              <AlertCircle size={22} />
              <div>
                <strong>We couldn’t load your workspace</strong>
                <p>{error}</p>
              </div>
              <button className="button secondary" onClick={load}>
                Try again
              </button>
            </div>
          )}
          {view !== "Accounts" && (
            <section className="stats">
              {[
                [
                  Users,
                  "Total employees",
                  employees.length,
                  "All employee records",
                  "violet",
                ],
                [
                  UserCheck,
                  "Active",
                  active,
                  "Currently active employees",
                  "green",
                ],
                [
                  Building2,
                  "Departments",
                  groups.length,
                  "Teams across your workspace",
                  "blue",
                ],
                [
                  UserPlus,
                  "New joiners",
                  newJoins,
                  "Joined in the last 30 days",
                  "amber",
                ],
              ].map(([Icon, title, value, caption, color]) => (
                <div className="stat-card" key={title}>
                  <div className="stat-top">
                    <span>{title}</span>
                    <div className={`stat-icon ${color}`}>
                      <Icon size={19} />
                    </div>
                  </div>
                  <strong>{loading || error ? "—" : value}</strong>
                  <small>{caption}</small>
                </div>
              ))}
            </section>
          )}
          {view === "Employees" && (
            <section className="directory">
              <div className="directory-top">
                <div>
                  <span className="tab active">Directory</span>
                  <span className="tab-description">
                    Your team, at a glance
                  </span>
                </div>
                <button
                  className="icon-button"
                  title="Refresh employees"
                  aria-label="Refresh employees"
                  onClick={load}
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? "spin" : ""} />
                </button>
              </div>
              <div className="filters">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    aria-label="Search employees"
                    placeholder="Search by name, email or role…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <select
                  aria-label="Filter by department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option>All departments</option>
                  {departments.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>All statuses</option>
                  {Object.entries(labels).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <button
                          className="sort-button"
                          onClick={() =>
                            setSort(sort === "name" ? "recent" : "name")
                          }
                        >
                          EMPLOYEE <ArrowUpDown size={13} />
                        </button>
                      </th>
                      <th>DEPARTMENT</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>JOINED</th>
                      <th className="actions-heading">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading &&
                      !error &&
                      visible.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <div className="person">
                              <div className={`avatar tone-${e.id % 5}`}>
                                {initials(e.name)}
                              </div>
                              <div>
                                <strong>{e.name}</strong>
                                <small>{e.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>{e.department}</td>
                          <td>{e.role}</td>
                          <td>
                            <Badge status={e.status} />
                          </td>
                          <td className="date">
                            {new Date(
                              e.joinedOn + "T00:00:00",
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <div className="row-actions">
                              {isAdmin ? (
                                <>
                                  <button
                                    className="icon-button"
                                    aria-label={`Edit ${e.name}`}
                                    title="Edit employee"
                                    onClick={() => setModal({ employee: e })}
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    className="icon-button delete"
                                    aria-label={`Delete ${e.name}`}
                                    title="Delete employee"
                                    onClick={() => setDeleting(e)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="read-only">View only</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {(loading || error || !filtered.length) && (
                <div className="empty-state">
                  <Users size={32} />
                  <h3>
                    {loading
                      ? "Loading your team…"
                      : error
                        ? "Backend connection required"
                        : employees.length
                          ? "No matching employees"
                          : "Your team starts here"}
                  </h3>
                  <p>
                    {loading
                      ? "Fetching records from the API."
                      : error
                        ? "Start the backend, then click Try again."
                        : employees.length
                          ? "Try a different search or clear your filters."
                          : "Add your first employee to populate the directory."}
                  </p>
                  {!loading && !error && employees.length > 0 && (
                    <button
                      className="button secondary"
                      onClick={() => {
                        setQuery("");
                        setDepartment("All departments");
                        setStatus("All statuses");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
              <footer className="table-footer">
                <span>
                  {filtered.length
                    ? `${(currentPage - 1) * 6 + 1}–${Math.min(currentPage * 6, filtered.length)}`
                    : "0"}{" "}
                  of {filtered.length} employees
                </span>
                <div className="pagination">
                  <button
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <span>
                    {currentPage} / {maxPage}
                  </span>
                  <button
                    aria-label="Next page"
                    disabled={currentPage === maxPage}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </footer>
            </section>
          )}
          {view === "Overview" && (
            <section className="overview-grid">
              <div className="panel">
                <h2>Team distribution</h2>
                <p className="muted">Employees by department</p>
                {groups.map((dep) => {
                  const count = employees.filter(
                    (e) => e.department === dep,
                  ).length;
                  return (
                    <div className="bar-row" key={dep}>
                      <div>
                        <span>{dep}</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="bar-track">
                        <span
                          style={{
                            width: `${(count / employees.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!groups.length && (
                  <p className="muted">
                    Add employees to see your team distribution.
                  </p>
                )}
              </div>
              <div className="panel">
                <h2>Recently added</h2>
                <p className="muted">The latest people in your directory</p>
                {employees.slice(0, 5).map((e) => (
                  <div className="recent-person" key={e.id}>
                    <div className={`avatar tone-${e.id % 5}`}>
                      {initials(e.name)}
                    </div>
                    <div>
                      <strong>{e.name}</strong>
                      <small>{e.role}</small>
                    </div>
                    <Badge status={e.status} />
                  </div>
                ))}
                <button
                  className="text-button"
                  onClick={() => setView("Employees")}
                >
                  View employee directory <ArrowUpRight size={16} />
                </button>
              </div>
            </section>
          )}
          {view === "Departments" && (
            <section className="department-grid">
              {groups.map((dep) => {
                const people = employees.filter((e) => e.department === dep);
                return (
                  <div className="panel department-card" key={dep}>
                    <div className="stat-icon blue">
                      <Building2 size={22} />
                    </div>
                    <h2>{dep}</h2>
                    <p className="muted">
                      {people.length} employees ·{" "}
                      {people.filter((e) => e.status === "ACTIVE").length}{" "}
                      active
                    </p>
                    <div className="avatar-stack">
                      {people.slice(0, 5).map((e) => (
                        <div
                          key={e.id}
                          title={e.name}
                          className={`avatar tone-${e.id % 5}`}
                        >
                          {initials(e.name)}
                        </div>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setView("Employees");
                        setQuery("");
                        setDepartment(dep);
                        setStatus("All statuses");
                      }}
                    >
                      View team <ArrowUpRight size={16} />
                    </button>
                  </div>
                );
              })}
              {!groups.length && (
                <div className="panel">
                  Departments appear when you add employee records.
                </div>
              )}
            </section>
          )}
          {view === "Accounts" && isAdmin && <Accounts user={user} />}
          <div className="workspace-footer">
            <span>
              <Database size={14} />
              {mode || "Waiting for backend"}
            </span>
            <span>PeopleFlow · Employee Management</span>
          </div>
        </main>
      </div>
      {passwordOpen && (
        <PasswordDialog
          onClose={() => setPasswordOpen(false)}
          onChanged={onPasswordChanged}
        />
      )}{" "}
      {isAdmin && modal && (
        <Form
          employee={modal.employee}
          departments={departments}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}{" "}
      {isAdmin && deleting && (
        <DeleteDialog
          employee={deleting}
          onClose={() => setDeleting(null)}
          onDelete={remove}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          <div>
            <Check size={17} />
          </div>
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            className="icon-button"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
