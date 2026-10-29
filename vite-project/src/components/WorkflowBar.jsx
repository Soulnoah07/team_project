import React from 'react';
import { useApp } from '../context/AppContext';

export default function WorkflowBar() {
  const {
    currentWorkflowStep,
    setCurrentWorkflowStep,
    activeFlowGuidance,
    setActiveFlowGuidance,
    navigateTo,
    currentView
  } = useApp();

  const STEPS = [
    { num: 1, name: '1. Start', view: 'home' },
    { num: 2, name: '2. Login', view: 'home', action: 'auth' },
    { num: 3, name: '3. Home', view: 'home' },
    { num: 4, name: '4. Discover', view: 'discovery' },
    { num: 5, name: '5. Details', view: 'product-detail' },
    { num: 6, name: '6. Cart / Wishlist', view: 'cart' },
    { num: 7, name: '7. Price Assistant', view: 'cart' },
    { num: 8, name: '8. Checkout', view: 'checkout' },
    { num: 9, name: '9. Order Tracking', view: 'orders' },
    { num: 10, name: '10. Reviews & Returns', view: 'product-detail' },
    { num: 11, name: '11. End Workflow', view: 'workflow-guide' }
  ];

  const triggerAlternativeFlow = (flowKey) => {
    setActiveFlowGuidance(flowKey);
    switch (flowKey) {
      case 'wishlist':
        navigateTo('product-detail', { productId: 'prod-3', guidance: 'wishlist' });
        break;
      case 'search':
        navigateTo('discovery', { guidance: 'search' });
        break;
      case 'return':
        navigateTo('orders', { guidance: 'return' });
        break;
      case 'review':
        navigateTo('product-detail', { productId: 'prod-1', guidance: 'review' });
        break;
      case 'price':
        navigateTo('cart', { guidance: 'price' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="workflow-strip py-2 px-3 border-bottom">
      <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-2">
        {/* Step indicator */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-primary text-uppercase px-2 py-1" style={{ fontSize: '0.72rem' }}>
            <i className="bi bi-diagram-3-fill me-1"></i> Workflow Step {currentWorkflowStep}/11
          </span>
          <div className="d-none d-lg-flex align-items-center gap-1 overflow-auto" style={{ maxWidth: '650px' }}>
            {STEPS.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setCurrentWorkflowStep(s.num);
                  navigateTo(s.view, { step: s.num });
                }}
                className={`btn btn-sm py-0 px-2 rounded-pill text-nowrap ${
                  currentWorkflowStep === s.num
                    ? 'btn-primary text-white fw-bold'
                    : 'btn-outline-secondary text-light'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Alternative Flows Quick Launch */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="text-secondary small fw-semibold d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
            Alternative Flows:
          </span>
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => triggerAlternativeFlow('wishlist')}
              className={`btn btn-sm ${activeFlowGuidance === 'wishlist' ? 'btn-info text-white' : 'btn-dark border-secondary'}`}
              title="Home → Product → Wishlist → Move to Cart"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-heart-fill text-danger me-1"></i> Wishlist Flow
            </button>
            <button
              onClick={() => triggerAlternativeFlow('search')}
              className={`btn btn-sm ${activeFlowGuidance === 'search' ? 'btn-info text-white' : 'btn-dark border-secondary'}`}
              title="Home → Search/Filter → Details → Cart"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-search text-warning me-1"></i> Search Flow
            </button>
            <button
              onClick={() => triggerAlternativeFlow('price')}
              className={`btn btn-sm ${activeFlowGuidance === 'price' ? 'btn-info text-white' : 'btn-dark border-secondary'}`}
              title="Cart → Price Breakdown → Read Explanation → Checkout"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-calculator text-success me-1"></i> Price Assistant Flow
            </button>
            <button
              onClick={() => triggerAlternativeFlow('review')}
              className={`btn btn-sm ${activeFlowGuidance === 'review' ? 'btn-info text-white' : 'btn-dark border-secondary'}`}
              title="Product Details → Submit Review → Rule-Based Check"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-shield-check text-primary me-1"></i> Review Flow
            </button>
            <button
              onClick={() => triggerAlternativeFlow('return')}
              className={`btn btn-sm ${activeFlowGuidance === 'return' ? 'btn-info text-white' : 'btn-dark border-secondary'}`}
              title="Orders → Select Order → Submit Return → Refund Status"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-arrow-repeat text-info me-1"></i> Return Flow
            </button>
          </div>

          <button
            onClick={() => navigateTo('workflow-guide')}
            className={`btn btn-sm ${currentView === 'workflow-guide' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
            style={{ fontSize: '0.75rem', fontWeight: 600 }}
          >
            <i className="bi bi-journal-text me-1"></i> Report & Guide
          </button>
        </div>
      </div>

      {/* Guided Banner when an alternative flow is active */}
      {activeFlowGuidance && (
        <div className="container-fluid mt-2">
          <div className="alert alert-info py-2 px-3 mb-0 d-flex align-items-center justify-content-between rounded-3 border-0 bg-opacity-75">
            <div className="d-flex align-items-center gap-2 small">
              <i className="bi bi-info-circle-fill fs-6 text-info"></i>
              <span>
                <strong>Active Demo Flow: </strong>
                {activeFlowGuidance === 'wishlist' && 'Wishlist Flow: Explore product specs, save to Wishlist, open Wishlist, and click "Move to Cart".'}
                {activeFlowGuidance === 'search' && 'Search Flow: Use the live search bar or filter chips to find items, open product details, and add to cart.'}
                {activeFlowGuidance === 'price' && 'Price Assistant Flow: Review cart totals, click "Ask Price Breakdown Assistant" for simulated AI explanation, and proceed to checkout.'}
                {activeFlowGuidance === 'review' && 'Review Flow: Scroll to reviews on product details, type or autofill sample text, and watch the Rule-Based Suspicious Review Engine analyze flags.'}
                {activeFlowGuidance === 'return' && 'Return Flow: Select the delivered demo order, click "Request Demo Return & Refund", submit reasons, and simulate refund stages.'}
              </span>
            </div>
            <button
              onClick={() => setActiveFlowGuidance(null)}
              className="btn btn-sm btn-close ms-2"
              aria-label="Close guidance"
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}
