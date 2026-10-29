import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, DEMO_USERS } from "../data/products";

export default function Navbar({ onOpenAuth }) {
  const {
    user,
    users,
    cart,
    wishlist,
    orders,
    compareList,
    navigateTo,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    products,
    loginDemoUser,
    logoutUser,
  } = useApp();

  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Quick live search matching suggestions
  const quickSuggestions = searchQuery.trim()
    ? products
        .filter((p) => {
          const matchCat =
            selectedCategory === "all" || p.category === selectedCategory;
          const matchQuery =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
          return matchCat && matchQuery;
        })
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateTo("discovery", { step: 4 });
  };

  return (
    <header className="sticky-top shadow-sm" style={{ zIndex: 1030 }}>
      {/* 1. MAIN NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-2 px-3 border-bottom">
        <div className="container-fluid">
          {/* Brand Logo */}
          <button
            className="navbar-brand d-flex align-items-center gap-2 border-0 bg-transparent p-0 me-3"
            onClick={() => navigateTo("home", { step: 3 })}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white"
              style={{
                width: "42px",
                height: "42px",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
              }}
            >
              <i className="bi bi-bag-check-fill fs-5"></i>
            </div>
            <div className="text-start">
              <span className="brand-badge fs-4 lh-1 fw-extrabold">
                NOAH MART
              </span>
              <small
                className="d-block text-secondary"
                style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
              >
                ONLINE STORE
              </small>
            </div>
          </button>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMainContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Center Search Bar */}
          <div className="collapse navbar-collapse" id="navbarMainContent">
            <form
              onSubmit={handleSearchSubmit}
              className="d-flex mx-lg-auto my-2 my-lg-0 position-relative w-100"
              style={{ maxWidth: "580px" }}
            >
              <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                {/* Category select inside search bar */}
                <select
                  className="form-select bg-light border-0 small text-secondary px-3"
                  style={{
                    maxWidth: "140px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name === "All Categories" ? "All" : c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="form-control border-0 bg-white shadow-none ps-3"
                  placeholder="Search products, brands, tech specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  style={{ fontSize: "0.88rem" }}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn btn-white border-0 text-muted px-2"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}

                <button
                  className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-1"
                  type="submit"
                >
                  <i className="bi bi-search"></i>
                  <span className="d-none d-sm-inline small">Search</span>
                </button>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {searchFocused && quickSuggestions.length > 0 && (
                <div
                  className="position-absolute w-100 bg-white rounded-4 shadow-lg border p-2 mt-1"
                  style={{ top: "100%", left: 0, zIndex: 1050 }}
                >
                  <div
                    className="text-uppercase text-muted px-3 py-1 fw-bold"
                    style={{ fontSize: "0.68rem" }}
                  >
                    Matching Products ({quickSuggestions.length}):
                  </div>
                  {quickSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        navigateTo("product-detail", {
                          productId: p.id,
                          step: 5,
                        });
                      }}
                      className="dropdown-item d-flex align-items-center gap-3 p-2 rounded-3 text-start hover-bg-light"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        style={{
                          width: "42px",
                          height: "42px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="text-truncate fw-bold text-dark small">
                          {p.name}
                        </div>
                        <div
                          className="d-flex align-items-center gap-2 small text-muted"
                          style={{ fontSize: "0.72rem" }}
                        >
                          <span className="text-primary fw-bold">
                            ${p.price.toFixed(2)}
                          </span>
                          <span>•</span>
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span className="text-warning">★ {p.rating}</span>
                        </div>
                      </div>
                      <span className="badge bg-light text-secondary border small">
                        Inspect
                      </span>
                    </button>
                  ))}
                  <div className="border-top pt-2 mt-1 text-center">
                    <button
                      type="button"
                      onClick={() => navigateTo("discovery", { step: 4 })}
                      className="btn btn-link btn-sm text-decoration-none small text-primary p-0"
                    >
                      View all results in Discovery Catalog →
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Right Action Buttons */}
            <div className="d-flex align-items-center gap-2 ms-lg-3 my-2 my-lg-0 justify-content-end">
              {/* Compare Button */}
              <button
                onClick={() => navigateTo("compare")}
                className={`btn btn-sm rounded-pill px-3 position-relative border ${
                  compareList.length > 0
                    ? "btn-primary text-white"
                    : "btn-light text-dark"
                }`}
                title="Compare Products side-by-side"
              >
                <i className="bi bi-arrow-left-right me-1"></i>
                <span className="small d-none d-xl-inline">Compare</span>
                {compareList.length > 0 && (
                  <span className="badge rounded-pill bg-warning text-dark ms-1">
                    {compareList.length}
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => navigateTo("wishlist", { step: 6 })}
                className="btn btn-sm btn-light border rounded-pill px-3 position-relative text-dark"
                title="View Saved Wishlist"
              >
                <i
                  className={`bi ${wishlist.length > 0 ? "bi-heart-fill text-danger" : "bi-heart text-secondary"} me-1`}
                ></i>
                <span className="small d-none d-xl-inline">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="badge rounded-pill bg-danger text-white ms-1">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Orders Tracking Button */}
              <button
                onClick={() => navigateTo("orders", { step: 9 })}
                className="btn btn-sm btn-light border rounded-pill px-3 position-relative text-dark"
                title="Track Orders & Returns"
              >
                <i className="bi bi-box-seam text-dark me-1"></i>
                <span className="small d-none d-xl-inline">Orders</span>
                {orders.length > 0 && (
                  <span className="badge rounded-pill bg-secondary text-white ms-1">
                    {orders.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => navigateTo("cart", { step: 6 })}
                className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm"
                title="Shopping Cart & Price Breakdown"
              >
                <div className="position-relative">
                  <i className="bi bi-cart3 fs-6"></i>
                  {cartItemCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="fw-bold small d-none d-sm-inline">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </button>

              {/* User Account Dropdown */}
              <div className="position-relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-3 py-1"
                >
                  <i className="bi bi-person-circle fs-6 text-primary"></i>
                  <span className="small fw-semibold d-none d-md-inline">
                    {user ? user.name.split(" ")[0] : "Sign In"}
                  </span>
                  <i
                    className="bi bi-chevron-down small text-muted"
                    style={{ fontSize: "0.65rem" }}
                  ></i>
                </button>

                {showUserDropdown && (
                  <div
                    className="position-absolute end-0 bg-white rounded-3 shadow-lg border p-2 mt-1"
                    style={{ width: "240px", zIndex: 1060 }}
                  >
                    {user ? (
                      <div>
                        <div className="px-3 py-2 border-bottom">
                          <div className="fw-bold text-dark small">
                            {user.name}
                          </div>
                          <small className="text-muted d-block text-truncate">
                            {user.email}
                          </small>
                          <span className="badge bg-success-subtle text-success mt-1 small">
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigateTo('login');
                          }}
                          className="dropdown-item py-2 small"
                        >
                          <i className="bi bi-person-lines-fill me-2 text-primary"></i>{" "}
                          Manage Account / Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigateTo("orders", { step: 9 });
                          }}
                          className="dropdown-item py-2 small"
                        >
                          <i className="bi bi-truck me-2 text-info"></i> My
                          Orders & Returns
                        </button>
                        <div className="border-top my-1"></div>
                        <div
                          className="px-2 py-1 text-muted small"
                          style={{ fontSize: "0.68rem" }}
                        >
                          Switch User Account:
                        </div>
                        {(users && users.length > 0 ? users : DEMO_USERS).map((u, i) => (
                          <button
                            key={u.id || i}
                            onClick={() => {
                              loginDemoUser(i);
                              setShowUserDropdown(false);
                            }}
                            className="dropdown-item py-1 small text-muted text-truncate"
                          >
                            • {u.name} ({u.role || 'Member'})
                          </button>
                        ))}
                        <div className="border-top my-1"></div>
                        <button
                          onClick={() => {
                            logoutUser();
                            setShowUserDropdown(false);
                          }}
                          className="dropdown-item py-2 small text-danger"
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> Log Out
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-2 text-muted small">
                          Sign in to save cart, track orders, and write reviews.
                        </div>
                        <div className="d-grid gap-2 mb-2">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigateTo('login');
                            }}
                            className="btn btn-primary btn-sm rounded-pill"
                          >
                            <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                          </button>
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigateTo('register');
                            }}
                            className="btn btn-outline-primary btn-sm rounded-pill"
                          >
                            <i className="bi bi-person-plus me-1"></i> Register New Profile
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            loginDemoUser(0);
                            setShowUserDropdown(false);
                          }}
                          className="btn btn-light border btn-sm w-100 rounded-pill text-muted small"
                        >
                          Quick Sign In (Alex)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. CATEGORY SUB-BAR */}
      <div className="bg-light py-2 px-3 border-bottom d-none d-md-block">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div
            className="d-flex align-items-center gap-2 overflow-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            <button
              onClick={() => {
                setSelectedCategory("all");
                navigateTo("discovery", { category: "all", step: 4 });
              }}
              className={`btn btn-sm py-1 px-3 rounded-pill fw-semibold ${
                selectedCategory === "all"
                  ? "btn-dark text-white"
                  : "btn-outline-secondary border-0 text-dark"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              <i className="bi bi-grid-fill me-1 text-primary"></i> All Products
            </button>

            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  navigateTo("discovery", { category: cat.id, step: 4 });
                }}
                className={`btn btn-sm py-1 px-3 rounded-pill ${
                  selectedCategory === cat.id
                    ? "btn-primary text-white fw-semibold"
                    : "btn-outline-secondary border-0 text-secondary"
                }`}
                style={{ fontSize: "0.8rem" }}
              >
                <i className={`bi ${cat.icon} me-1`}></i> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
