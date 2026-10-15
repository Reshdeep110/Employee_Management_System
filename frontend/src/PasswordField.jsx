import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({
  label = "Password",
  name = "password",
  minLength,
  autoComplete = "current-password",
}) {
  const [show, setShow] = useState(false);
  return (
    <label>
      {label}
      <span className="password-field">
        <input
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          maxLength={72}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
