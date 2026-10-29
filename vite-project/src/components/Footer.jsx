import React from "react";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { navigateTo, resetAllDemoData } = useApp();

  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand info */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white"
                style={{
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                }}
              >
                <i className="bi bi-bag-check-fill fs-6"></i>
              </div>
              <span className="fs-5 fw-bold text-white">NOAH MART</span>
            </div>
            <p className="text-secondary small mb-3">
              Premium consumer electronics, computing gear, smart wearables, and
              lifestyle essentials with fast shipping and guaranteed
              satisfaction.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-secondary text-white small">
                Secure Shopping
              </span>
              <span className="badge bg-secondary text-white small">
                Free Delivery $50+
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold text-white small text-uppercase mb-3">
              Shop Catalog
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>
                <button
                  onClick={() => navigateTo("discovery", { category: "all" })}
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    navigateTo("discovery", { category: "electronics" })
                  }
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  Audio & Electronics
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    navigateTo("discovery", { category: "computing" })
                  }
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  Laptops & Phones
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    navigateTo("discovery", { category: "wearables" })
                  }
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  Smart Wearables
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold text-white small text-uppercase mb-3">
              Customer Service
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary">
              <li>
                <button
                  onClick={() => navigateTo("orders")}
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  <i className="bi bi-box-seam me-1"></i> Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("orders")}
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  <i className="bi bi-arrow-repeat me-1"></i> Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("cart")}
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  <i className="bi bi-calculator me-1"></i> Price Breakdown
                  Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("wishlist")}
                  className="btn btn-link p-0 text-secondary text-decoration-none small"
                >
                  <i className="bi bi-heart me-1"></i> Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Settings & Reset */}
          <div className="col-lg-3">
            <h6 className="fw-bold text-white small text-uppercase mb-3">
              Demo Controls
            </h6>
            <p className="text-secondary small mb-3">
              Reset browser LocalStorage data back to clean factory default
              state anytime.
            </p>
            <button
              onClick={resetAllDemoData}
              className="btn btn-outline-secondary btn-sm rounded-pill text-light px-3"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Reset Store Data
            </button>
          </div>
        </div>

        <div className="border-top border-secondary pt-3 d-flex flex-wrap justify-content-between align-items-center text-secondary small">
          <div>© 2026 NOAH Mart Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
