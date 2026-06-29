import { useState, useEffect } from "react";
import { X, Loader2, Mail, Lock, User, Phone, Upload, Key } from "lucide-react";
import { authService } from "@/services/auth";
import { toastService } from "@/services/toastService";
import { env } from "@/config/env";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Verification states
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Cleanup preview URL on unmount or file change
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Countdown timer for Verification OTP code
  useEffect(() => {
    if (step !== "verify" || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStep("form");
    // Reset form states
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview("");
    setRegisteredEmail("");
    setVerificationCode("");
    setTimeLeft(300);
    setForgotEmail("");
    setNewPassword("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastService.warning("Kích thước file không được vượt quá 5MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toastService.warning("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login({ email, password });

      // Save data
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        toastService.success(res.message || "Đăng nhập thành công!");
        onSuccess(res.data);
        onClose();
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toastService.warning("Vui lòng điền các trường bắt buộc (Email, Mật khẩu, Họ tên).");
      return;
    }
    if (password.length < 6) {
      toastService.warning("Mật khẩu phải dài ít nhất 6 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      let uploadedAvatarUrl = null;

      // Handle avatar file upload to R2
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const baseUrl = env.apiBaseUrl || window.location.origin;
        const uploadRes = await fetch(`${baseUrl}/api/images`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Không thể tải lên ảnh đại diện.");
        }

        const uploadData = await uploadRes.json();
        uploadedAvatarUrl = uploadData?.data; // Retrieve absolute URL of uploaded file
      }

      const res = await authService.register({
        email,
        password,
        fullName,
        phone: phone.trim() || null,
        avatarUrl: uploadedAvatarUrl,
      });

      // Show OTP verification step screen
      setRegisteredEmail(email);
      setStep("verify");
      setTimeLeft(300); // 5 minutes
      toastService.success(res.message || "Mã xác thực đã được gửi vào email của bạn!");

    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Đăng ký thất bại. Email có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toastService.warning("Vui lòng điền đúng mã xác thực gồm 6 chữ số.");
      return;
    }
    if (timeLeft <= 0) {
      toastService.error("Mã xác thực đã hết hạn. Vui lòng quay lại đăng ký lại.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.verify({
        email: registeredEmail,
        code: verificationCode.trim(),
      });

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        toastService.success(res.message || "Kích hoạt tài khoản thành công!");
        onSuccess(res.data);
        onClose();
        handleTabChange("login"); // Reset state
      } else {
        throw new Error("Xác minh thành công nhưng không tự động đăng nhập được");
      }
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Mã xác thực không chính xác hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toastService.warning("Vui lòng nhập địa chỉ email.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword({ email: forgotEmail.trim() });
      setStep("reset");
      toastService.success("Mã khôi phục mật khẩu đã được gửi vào email của bạn!");
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Không thể yêu cầu mã khôi phục mật khẩu. Vui lòng kiểm tra lại email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toastService.warning("Vui lòng điền đúng mã xác thực gồm 6 chữ số.");
      return;
    }
    if (!newPassword.trim()) {
      toastService.warning("Vui lòng điền mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      toastService.warning("Mật khẩu mới phải dài ít nhất 6 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({
        email: forgotEmail.trim(),
        code: verificationCode.trim(),
        newPassword: newPassword.trim(),
      });
      toastService.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      // Go back to login tab
      setActiveTab("login");
      setStep("form");
      // Reset fields
      setPassword("");
      setVerificationCode("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Mã xác thực không chính xác hoặc đặt lại mật khẩu thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toastService.error("Không nhận được thông tin xác thực từ Google.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.googleLogin({ idToken });

      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        toastService.success(res.message || "Đăng nhập bằng Google thành công!");
        onSuccess(res.data);
        onClose();
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Đăng nhập bằng Google thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e7dfbd] bg-[#f6f4dd] p-6 shadow-xl transition-all duration-300">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#706b5c] hover:text-[#b84a25] transition-colors"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        {/* Logo and Titles */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold italic text-[#b84a25]">Tủ cũ chill</span>
          <p className="text-xs text-[#706b5c] mt-1">Sàn giao dịch thời trang secondhand hàng đầu</p>
        </div>

        {step === "form" ? (
          <>
            {/* Tab Headers */}
            <div className="flex border-b border-[#e7dfbd] mb-6">
              <button
                onClick={() => handleTabChange("login")}
                className={`flex-1 pb-2 text-center text-sm font-extrabold transition-all border-b-2 ${activeTab === "login"
                    ? "border-[#b84a25] text-[#b84a25]"
                    : "border-transparent text-[#706b5c] hover:text-[#3f3b2f]"
                  }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => handleTabChange("register")}
                className={`flex-1 pb-2 text-center text-sm font-extrabold transition-all border-b-2 ${activeTab === "register"
                    ? "border-[#b84a25] text-[#b84a25]"
                    : "border-transparent text-[#706b5c] hover:text-[#3f3b2f]"
                  }`}
              >
                Đăng ký
              </button>
            </div>

            {/* Google Login at the Top */}
            <div className="flex justify-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toastService.error("Đăng nhập bằng Google thất bại.");
                }}
                theme="outline"
                shape="pill"
                size="large"
                locale="vi"
              />
            </div>

            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e7dfbd]"></div>
              </div>
              <span className="relative bg-[#f6f4dd] px-3 text-[10px] uppercase font-bold tracking-wider text-[#706b5c]">Hoặc tiếp tục bằng email</span>
            </div>

            {/* Tab Contents */}
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3f3b2f]">Email đăng nhập</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#3f3b2f]">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => setStep("forgot")}
                      className="text-xs font-bold text-[#b84a25] hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b84a25] py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="animate-spin" size={16} />}
                  <span>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">

                {/* Avatar Picker UI */}
                <div className="flex flex-col items-center space-y-2 mb-4">
                  <label className="text-xs font-semibold text-[#3f3b2f] self-start">Ảnh đại diện (Avatar)</label>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-input"
                      disabled={isLoading}
                    />
                    <label htmlFor="avatar-input" className="cursor-pointer block">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-[#b84a25] shadow"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full border-2 border-dashed border-[#b84a25]/40 bg-white flex items-center justify-center text-[#706b5c] hover:bg-[#b84a25]/5 transition-colors">
                          <Upload size={24} className="text-[#b84a25]/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                        Thay đổi
                      </div>
                    </label>
                  </div>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-[10px] text-[#b84a25] font-semibold hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3f3b2f]">Họ tên của bạn *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3f3b2f]">Email *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3f3b2f]">Số điện thoại</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xxxxxxxx"
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#3f3b2f]">Mật khẩu *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b84a25] py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="animate-spin" size={16} />}
                  <span>{isLoading ? "Đang đăng ký..." : "Đăng ký ngay"}</span>
                </button>
              </form>
            )}
          </>
        ) : step === "verify" ? (
          /* Verification OTP Screen */
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-extrabold text-[#3f3b2f] mb-1">Xác thực tài khoản</h3>
              <p className="text-xs text-[#706b5c] px-4">
                Mã xác thực gồm 6 chữ số đã được gửi đến email:<br />
                <span className="font-semibold text-[#b84a25]">{registeredEmail}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#3f3b2f] block text-center">
                Nhập mã xác nhận (OTP)
              </label>
              <div className="relative max-w-[200px] mx-auto">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                  <Key size={16} />
                </span>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="w-full text-center tracking-[4px] font-extrabold rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-base text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-[#706b5c]">
                Mã xác thực hết hạn sau:{" "}
                <span className={`font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-[#b84a25]"}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
              {timeLeft <= 0 && (
                <p className="text-[10px] text-red-500 font-semibold">
                  Mã xác thực đã hết hạn. Vui lòng bấm quay lại để đăng ký lại.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-[#e7dfbd] py-2.5 text-xs font-bold text-[#706b5c] transition-colors hover:bg-white/40 disabled:cursor-not-allowed"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading || timeLeft <= 0}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#b84a25] py-2.5 text-xs font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Loader2 className="animate-spin" size={14} />}
                <span>Xác minh</span>
              </button>
            </div>
          </form>
        ) : step === "forgot" ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-extrabold text-[#3f3b2f] mb-1">Quên mật khẩu</h3>
              <p className="text-xs text-[#706b5c] px-4">
                Nhập email đã đăng ký tài khoản của bạn để nhận mã OTP đặt lại mật khẩu.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3f3b2f]">Email tài khoản</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b84a25] py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              <span>{isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("form");
                setActiveTab("login");
              }}
              className="w-full text-center text-xs font-bold text-[#706b5c] hover:text-[#b84a25] transition-colors mt-2 cursor-pointer"
            >
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-base font-extrabold text-[#3f3b2f] mb-1">Đặt lại mật khẩu</h3>
              <p className="text-xs text-[#706b5c] px-4">
                Nhập mã OTP vừa được gửi đến email <span className="font-semibold text-[#b84a25]">{forgotEmail}</span> và mật khẩu mới của bạn.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3f3b2f]">Mã xác thực (OTP)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                  <Key size={16} />
                </span>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="XXXXXX"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#3f3b2f]">Mật khẩu mới</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#706b5c]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f3b2f] placeholder-[#8a8370] focus:border-[#b84a25] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b84a25] py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              <span>{isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("forgot")}
              className="w-full text-center text-xs font-bold text-[#706b5c] hover:text-[#b84a25] transition-colors mt-2 cursor-pointer"
            >
              Quay lại bước trước
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
