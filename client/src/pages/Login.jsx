import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRoundPlus
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import api from "../services/api";
import customerApi from "../services/customerApi";

const adminFeaturePoints = [
  "Role-based access for admins and managers",
  "Inventory, orders, analytics, and alerts in one workspace",
  "Recovery codes by email or phone when delivery is configured",
  "Session memory control with Remember me"
];

const shopperFeaturePoints = [
  "Fast sign in before adding products to cart and checkout",
  "Profile updates, booking history, and tracking from one menu",
  "Remembered shopper session for quicker return visits",
  "Recovery by email or phone when delivery is configured"
];

const createInitialRecovery = (identifier = "", channel = "email") => ({
  identifier,
  channel,
  code: "",
  newPassword: "",
  confirmPassword: ""
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { loginCustomer, registerCustomer } = useCustomerAuth();

  const [portal, setPortal] = useState("admin");
  const [mode, setMode] = useState("login");
  const [shopperMode, setShopperMode] = useState("login");

  const [adminForm, setAdminForm] = useState({
    email: "admin@techmart.com",
    password: "admin123",
    rememberMe: true
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    rememberMe: true
  });

  const [recovery, setRecovery] = useState(createInitialRecovery("admin@techmart.com"));
  const [resetRequested, setResetRequested] = useState(false);
  const [recoveryHint, setRecoveryHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const audienceCopy = useMemo(
    () =>
      portal === "admin"
        ? {
            badge: "Admin Workspace",
            title: "Secure operations, polished workflows, and reliable recovery.",
            description:
              "Sign in to the control center built for retail teams. Manage stock, orders, reports, and user access from one professional admin workspace.",
            points: adminFeaturePoints
          }
        : {
            badge: "Customer Access",
            title: "Sign in fast, shop smoothly, and manage every order in one place.",
            description:
              "Customer accounts unlock profile updates, booking history, and order tracking directly from the store navbar after sign in.",
            points: shopperFeaturePoints
          },
    [portal]
  );

  const resetRecoveryState = (identifier, channel = "email") => {
    setResetRequested(false);
    setRecoveryHint("");
    setRecovery(createInitialRecovery(identifier, channel));
    setError("");
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(adminForm);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginCustomer(customerForm);
      const from = location.state?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Customer sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerCustomer(customerForm);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create customer account");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryRequest = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const targetApi = portal === "admin" ? api : customerApi;
      const endpoint =
        portal === "admin"
          ? "/auth/forgot-password/request"
          : "/customers/forgot-password/request";

      const { data } = await targetApi.post(endpoint, {
        identifier: recovery.identifier,
        channel: recovery.channel
      });

      setResetRequested(true);
      setRecoveryHint(data.destinationHint || "");
      toast.success(data.message);

      if (data.previewCode) {
        toast(`Dev preview code: ${data.previewCode}`, { icon: "OTP" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send recovery code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (recovery.newPassword !== recovery.confirmPassword) {
      setLoading(false);
      setError("Passwords do not match");
      return;
    }

    try {
      const targetApi = portal === "admin" ? api : customerApi;
      const endpoint =
        portal === "admin"
          ? "/auth/forgot-password/reset"
          : "/customers/forgot-password/reset";

      const { data } = await targetApi.post(endpoint, {
        identifier: recovery.identifier,
        code: recovery.code,
        newPassword: recovery.newPassword
      });

      toast.success(data.message);
      setMode("login");
      setShopperMode("login");
      resetRecoveryState(recovery.identifier);

      if (portal === "admin") {
        setAdminForm((current) => ({
          ...current,
          email: recovery.identifier.includes("@") ? recovery.identifier : current.email,
          password: ""
        }));
      } else {
        setCustomerForm((current) => ({
          ...current,
          email: recovery.identifier.includes("@") ? recovery.identifier : current.email,
          password: ""
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  const switchPortal = (nextPortal) => {
    setPortal(nextPortal);
    setError("");
    setMode("login");
    setShopperMode("login");
    resetRecoveryState(nextPortal === "admin" ? adminForm.email : customerForm.email);
  };

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute left-10 top-10 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/90 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur xl:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#0E0559_0%,#09097e_40%,#00d4ff_100%)] px-8 py-10 text-white sm:px-10 sm:py-12 xl:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.24),transparent_34%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100">
              <Sparkles size={14} />
              {audienceCopy.badge}
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {audienceCopy.title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-sky-100/90">
              {audienceCopy.description}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {audienceCopy.points.map((item, index) => (
                <div
                  key={item}
                  className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 transition backdrop-blur-md hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                >
                  <span
                    className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full shadow-inner ${
                      index % 4 === 0
                        ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white"
                        : index % 4 === 1
                          ? "bg-gradient-to-br from-purple-400 to-indigo-500 text-white"
                          : index % 4 === 2
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                            : "bg-gradient-to-br from-pink-400 to-rose-500 text-white"
                    }`}
                  >
                    <ShieldCheck size={18} />
                  </span>
                  <p className="text-sm font-medium leading-6 text-white/90">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="relative inline-flex w-full max-w-sm rounded-full bg-slate-100 p-1 shadow-inner">
            <div
              className={`absolute bottom-1 top-1 w-1/2 rounded-full bg-[linear-gradient(135deg,#0096D1,#48E03A)] shadow-[0_6px_18px_rgba(14,165,233,0.28)] transition-all duration-300 ${
                portal === "admin" ? "left-1" : "left-1/2"
              }`}
            />

            <button
              type="button"
              onClick={() => switchPortal("admin")}
              className={`relative z-10 w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                portal === "admin" ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin Access
            </button>

            <button
              type="button"
              onClick={() => switchPortal("customer")}
              className={`relative z-10 w-1/2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                portal === "customer" ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Shopper Access
            </button>
          </div>

          {portal === "admin" ? (
            <>
              <div className="mt-7">
                <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Sign in with your admin or manager account. Use recovery if you
                  need a one-time code by email or phone.
                </p>
              </div>

              {mode === "login" ? (
                <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
                  <AuthField label="Email" icon={Mail}>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(event) =>
                        setAdminForm({ ...adminForm, email: event.target.value })
                      }
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="admin@techmart.com"
                    />
                  </AuthField>

                  <PasswordField
                    label="Password"
                    value={adminForm.password}
                    onChange={(event) =>
                      setAdminForm({ ...adminForm, password: event.target.value })
                    }
                    show={showPassword}
                    setShow={setShowPassword}
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={adminForm.rememberMe}
                        onChange={(event) =>
                          setAdminForm({
                            ...adminForm,
                            rememberMe: event.target.checked
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("recover");
                        resetRecoveryState(adminForm.email);
                      }}
                      className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && <ErrorBanner error={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-[linear-gradient(90deg,#170F59_0%,#101091_35%,#00D4FF_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_20px_35px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Signing in..." : "Login to Dashboard"}
                  </button>
                </form>
              ) : (
                <RecoveryPanel
                  recovery={recovery}
                  setRecovery={setRecovery}
                  resetRequested={resetRequested}
                  recoveryHint={recoveryHint}
                  loading={loading}
                  error={error}
                  onSubmit={resetRequested ? handlePasswordReset : handleRecoveryRequest}
                  onResetRequest={() => resetRecoveryState(adminForm.email)}
                  onBackToSignIn={() => {
                    setMode("login");
                    setError("");
                  }}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              )}
            </>
          ) : (
            <>
              <div className="mt-7">
                <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                  Customer sign in
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Sign in as a shopper, create a new account, or recover access. After
                  login, you will land on the home page ready to shop.
                </p>
              </div>

              <div className="relative mt-7 inline-flex w-full max-w-sm rounded-full bg-slate-100 p-1 shadow-inner">
                <div
                  className={`absolute bottom-1 top-1 rounded-full bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] transition-all duration-300 ${
                    shopperMode === "login"
                      ? "left-1 w-1/2"
                      : shopperMode === "register"
                        ? "left-1/2 w-1/2"
                        : "left-1 w-1/2"
                  }`}
                />
                {[
                  { key: "login", label: "Sign In" },
                  { key: "register", label: "Sign Up" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setShopperMode(item.key);
                      setError("");
                    }}
                    className={`relative z-10 w-1/2 rounded-full px-4 py-2 text-sm font-semibold ${
                      shopperMode === item.key ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {shopperMode === "login" && (
                <form onSubmit={handleCustomerLogin} className="mt-8 space-y-5">
                  <AuthField label="Email" icon={Mail}>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(event) =>
                        setCustomerForm({ ...customerForm, email: event.target.value })
                      }
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="you@example.com"
                    />
                  </AuthField>

                  <PasswordField
                    label="Password"
                    value={customerForm.password}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, password: event.target.value })
                    }
                    show={showPassword}
                    setShow={setShowPassword}
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={customerForm.rememberMe}
                        onChange={(event) =>
                          setCustomerForm({
                            ...customerForm,
                            rememberMe: event.target.checked
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setShopperMode("recover");
                        resetRecoveryState(customerForm.email);
                      }}
                      className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && <ErrorBanner error={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#07132d_0%,#163fbd_50%,#2563eb_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <ShoppingBag size={18} />
                    {loading ? "Signing in..." : "Sign In and Shop"}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShopperMode("register");
                        setError("");
                      }}
                      className="font-semibold text-blue-700 transition hover:text-blue-800"
                    >
                      Create account
                    </button>
                  </p>
                </form>
              )}

              {shopperMode === "register" && (
                <form onSubmit={handleCustomerRegister} className="mt-8 space-y-5">
                  <AuthField label="Full Name" icon={UserRoundPlus}>
                    <input
                      value={customerForm.name}
                      onChange={(event) =>
                        setCustomerForm({ ...customerForm, name: event.target.value })
                      }
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="Enter your full name"
                    />
                  </AuthField>

                  <AuthField label="Email" icon={Mail}>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(event) =>
                        setCustomerForm({ ...customerForm, email: event.target.value })
                      }
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="you@example.com"
                    />
                  </AuthField>

                  <AuthField label="Phone" icon={Phone}>
                    <input
                      value={customerForm.phone}
                      onChange={(event) =>
                        setCustomerForm({ ...customerForm, phone: event.target.value })
                      }
                      className="w-full bg-transparent text-slate-900 outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </AuthField>

                  <PasswordField
                    label="Create Password"
                    value={customerForm.password}
                    onChange={(event) =>
                      setCustomerForm({ ...customerForm, password: event.target.value })
                    }
                    show={showPassword}
                    setShow={setShowPassword}
                  />

                  <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={customerForm.rememberMe}
                      onChange={(event) =>
                        setCustomerForm({
                          ...customerForm,
                          rememberMe: event.target.checked
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    Keep me signed in on this device
                  </label>

                  {error && <ErrorBanner error={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#07132d_0%,#163fbd_50%,#2563eb_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <UserRoundPlus size={18} />
                    {loading ? "Creating account..." : "Create Customer Account"}
                  </button>
                </form>
              )}

              {shopperMode === "recover" && (
                <RecoveryPanel
                  recovery={recovery}
                  setRecovery={setRecovery}
                  resetRequested={resetRequested}
                  recoveryHint={recoveryHint}
                  loading={loading}
                  error={error}
                  onSubmit={resetRequested ? handlePasswordReset : handleRecoveryRequest}
                  onResetRequest={() => resetRecoveryState(customerForm.email)}
                  onBackToSignIn={() => {
                    setShopperMode("login");
                    setError("");
                  }}
                  showNewPassword={showNewPassword}
                  setShowNewPassword={setShowNewPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AuthField = ({ label, icon: Icon, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
      <Icon
        size={18}
        className="text-slate-400 transition group-focus-within:text-blue-600"
      />
      {children}
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange, show, setShow }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
      <KeyRound
        size={18}
        className="text-slate-400 transition group-focus-within:text-blue-600"
      />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-slate-900 outline-none"
        placeholder="Enter your password"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-slate-400 transition hover:text-blue-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const RecoveryPanel = ({
  recovery,
  setRecovery,
  resetRequested,
  recoveryHint,
  loading,
  error,
  onSubmit,
  onResetRequest,
  onBackToSignIn,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword
}) => (
  <form onSubmit={onSubmit} className="mt-8 space-y-5">
    <AuthField label="Email or Phone" icon={recovery.channel === "phone" ? Phone : Mail}>
      <input
        value={recovery.identifier}
        onChange={(event) =>
          setRecovery({
            ...recovery,
            identifier: event.target.value
          })
        }
        className="w-full bg-transparent text-slate-900 outline-none"
        placeholder={recovery.channel === "phone" ? "9876500001" : "user@example.com"}
      />
    </AuthField>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Delivery Channel
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRecovery({ ...recovery, channel: "email" })}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            recovery.channel === "email"
              ? "border-blue-300 bg-blue-50 text-blue-800 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Mail size={16} />
            Email code
          </div>
          <p className="mt-1 text-sm">Send a reset OTP to your registered email.</p>
        </button>

        <button
          type="button"
          onClick={() => setRecovery({ ...recovery, channel: "phone" })}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            recovery.channel === "phone"
              ? "border-blue-300 bg-blue-50 text-blue-800 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <Phone size={16} />
            SMS code
          </div>
          <p className="mt-1 text-sm">Send a reset OTP to your registered phone.</p>
        </button>
      </div>
    </div>

    {resetRequested && (
      <>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Recovery code sent{recoveryHint ? ` to ${recoveryHint}` : ""}. Enter it
          below with your new password.
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Recovery Code
          </label>
          <input
            value={recovery.code}
            onChange={(event) =>
              setRecovery({ ...recovery, code: event.target.value })
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            placeholder="6-digit code"
          />
        </div>

        <PasswordField
          label="New Password"
          value={recovery.newPassword}
          onChange={(event) =>
            setRecovery({
              ...recovery,
              newPassword: event.target.value
            })
          }
          show={showNewPassword}
          setShow={setShowNewPassword}
        />

        <PasswordField
          label="Confirm New Password"
          value={recovery.confirmPassword}
          onChange={(event) =>
            setRecovery({
              ...recovery,
              confirmPassword: event.target.value
            })
          }
          show={showConfirmPassword}
          setShow={setShowConfirmPassword}
        />
      </>
    )}

    {error && <ErrorBanner error={error} />}

    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-[linear-gradient(90deg,#0f172a_0%,#1e3a8a_45%,#2563eb_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading
        ? "Please wait..."
        : resetRequested
          ? "Reset Password"
          : "Send Recovery Code"}
    </button>

    {resetRequested && (
      <button
        type="button"
        onClick={onResetRequest}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Request a New Code
      </button>
    )}

    <button
      type="button"
      onClick={onBackToSignIn}
      className="w-full text-sm font-semibold text-slate-600 transition hover:text-slate-900"
    >
      Back to sign in
    </button>
  </form>
);

const ErrorBanner = ({ error }) => (
  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
    {error}
  </p>
);

export default Login;
