import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DEMO_USERS } from "../data/products";

export default function AuthModal({ isOpen, onClose }) {
  const { user, loginDemoUser, registerUser, logoutUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  if (!isOpen) return null;

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      showToast("Please fill in your name and email address.", "warning");
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim(),
      role: "New Shopper",
      address: {
        fullName: customName.trim(),
        street: customAddress.trim() || "101 Demo Boulevard",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        phone: "+1 (555) 492-0193",
      },
    };
    registerUser(newUser);
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 px-4 pt-4 pb-3">
            <div>
              <h5 className="modal-title fw-bold">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                {user ? "Account Management" : "Sign In or Register"}
              </h5>
              <p className="text-secondary small mb-0">
                Step 2: Demo Authentication & User Profile
              </p>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {user ? (
              <div className="text-center py-3">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "64px", height: "64px", fontSize: "28px" }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
                <h5 className="fw-bold mb-1">{user.name}</h5>
                <p className="text-muted small mb-2">{user.email}</p>
                <span className="badge bg-success-subtle text-success border border-success-subtle mb-3">
                  <i className="bi bi-patch-check-fill me-1"></i>{" "}
                  {user.role || "Active Session"}
                </span>

                <div className="card bg-light border-0 text-start p-3 mb-4 rounded-3">
                  <span className="text-secondary small fw-bold text-uppercase">
                    Saved Demo Shipping Address
                  </span>
                  <p className="mb-0 small text-dark mt-1">
                    {user.address?.fullName} <br />
                    {user.address?.street}, {user.address?.city},{" "}
                    {user.address?.state} {user.address?.zipCode} <br />
                    Phone: {user.address?.phone}
                  </p>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={() => {
                      logoutUser();
                    }}
                    className="btn btn-outline-danger px-4"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i> Log Out
                  </button>
                  <button onClick={onClose} className="btn btn-primary px-4">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 rounded-2 ${activeTab === "login" ? "active bg-primary" : "text-secondary"}`}
                      onClick={() => setActiveTab("login")}
                    >
                      Quick Demo Login
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 rounded-2 ${activeTab === "register" ? "active bg-primary" : "text-secondary"}`}
                      onClick={() => setActiveTab("register")}
                    >
                      Register New Profile
                    </button>
                  </li>
                </ul>

                {activeTab === "login" ? (
                  <div>
                    <p className="text-muted small mb-3">
                      Choose one of the simulated accounts with pre-loaded
                      address and history:
                    </p>
                    <div className="d-grid gap-2 mb-3">
                      {DEMO_USERS.map((u, idx) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            loginDemoUser(idx);
                            onClose();
                          }}
                          className="btn btn-outline-primary text-start p-3 d-flex align-items-center justify-content-between rounded-3 border-2"
                        >
                          <div>
                            <div className="fw-bold">{u.name}</div>
                            <small className="text-muted">
                              {u.email} • {u.role}
                            </small>
                          </div>
                          <span className="badge bg-primary rounded-pill">
                            1-Click Login
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Jordan Lee"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="jordan.lee@example.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">
                        Shipping Address (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street Address, City, State"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                      />
                    </div>
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary py-2 fw-semibold"
                      >
                        <i className="bi bi-person-plus-fill me-1"></i> Create
                        Demo Profile
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
