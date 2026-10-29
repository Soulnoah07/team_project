import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function DeliveryMapView({ order, onSimulateAdvance }) {
  // Current active status to display (defaults to order.status or 'out_for_delivery')
  const [activeStage, setActiveStage] = useState(order?.status || 'out_for_delivery');

  // Progress percentage (0 to 100)
  const getInitialProgress = (status) => {
    switch (status) {
      case 'placed': return 5;
      case 'processing': return 25;
      case 'shipped': return 50;
      case 'out_for_delivery': return 72;
      case 'delivered': return 100;
      default: return 72;
    }
  };

  const [progress, setProgress] = useState(() => getInitialProgress(order?.status || 'out_for_delivery'));
  const [isAutoMoving, setIsAutoMoving] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [lastPing, setLastPing] = useState('Just now');
  const [isCalling, setIsCalling] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('Please ring bell and leave on the front porch.');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(deliveryNote);

  // Sync when order.status changes from parent
  useEffect(() => {
    if (order?.status) {
      setActiveStage(order.status);
      setProgress(getInitialProgress(order.status));
    }
  }, [order?.status]);

  // Real-time dynamic driving animation when activeStage is 'out_for_delivery' or 'shipped'
  useEffect(() => {
    if (!isAutoMoving) return;
    if (activeStage !== 'out_for_delivery' && activeStage !== 'shipped') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Reached destination!
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch (e) {}
          setActiveStage('delivered');
          if (onSimulateAdvance && order?.status !== 'delivered') {
            onSimulateAdvance();
          }
          return 100;
        }
        return Math.min(100, Number((prev + 0.35 * speedMultiplier).toFixed(2)));
      });
      setLastPing('1s ago');
    }, 400);

    return () => clearInterval(interval);
  }, [isAutoMoving, activeStage, speedMultiplier, onSimulateAdvance, order?.status]);

  // Cubic Bezier Coordinate Math for the Route
  // Route goes: Hub (80, 80) -> Waypoint 1 (220, 100) -> Waypoint 2 (420, 240) -> Destination (640, 280)
  const getRouteCoordinates = (pRatio) => {
    const t = Math.max(0, Math.min(1, pRatio));
    const p0 = { x: 80, y: 80 };
    const p1 = { x: 220, y: 100 };
    const p2 = { x: 420, y: 240 };
    const p3 = { x: 640, y: 280 };

    const x = Math.round(
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x
    );

    const y = Math.round(
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y
    );

    return { x, y };
  };

  const vanPos = getRouteCoordinates(progress / 100);

  // Dynamic telemetry metrics
  const remainingMiles = Math.max(0, ((100 - progress) * 0.038)).toFixed(1);
  const remainingMins = Math.max(1, Math.round((100 - progress) * 0.35));
  const stopsRemaining = Math.max(0, Math.ceil((100 - progress) / 22));

  // Dynamic street names based on route position
  const getCurrentStreet = (p) => {
    if (p < 15) return 'Apex Hub #4 Dispatch Bay (Departed)';
    if (p < 35) return 'Grand Avenue Highway (Speed: 45 mph)';
    if (p < 60) return 'Market Boulevard near Presidio Green Park (Speed: 28 mph)';
    if (p < 85) return 'Innovation Way & Pinecrest Ave (Speed: 22 mph)';
    if (p < 99) return 'Evergreen Terrace (Final Approach • Speed: 12 mph)';
    return 'Destination: 742 Evergreen Terrace (Arrived & Delivered!)';
  };

  // Stage change handler for interactive demo testing
  const handleSelectStage = (stageKey) => {
    setActiveStage(stageKey);
    setProgress(getInitialProgress(stageKey));
  };

  const handleFastForwardToDestination = () => {
    setProgress(98);
    setActiveStage('out_for_delivery');
    setIsAutoMoving(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    setDeliveryNote(noteInput);
    setIsEditingNote(false);
  };

  const destinationStreet = order?.shippingAddress?.street || '742 Evergreen Terrace';

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      {/* 1. Header with Live Status & Controls */}
      <div className="card-header bg-dark text-white p-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-0">
        <div className="d-flex align-items-center gap-2">
          <span className={`spinner-grow spinner-grow-sm ${progress >= 100 ? 'text-success' : 'text-danger'}`} role="status"></span>
          <div>
            <h6 className="fw-bold mb-0 text-white">
              Dynamic Live GPS Map Tracking
            </h6>
            <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
              Tracking Order: <strong className="text-white">{order?.id}</strong> • Carrier: {order?.carrier || 'ApexExpress'}
            </small>
          </div>
        </div>

        {/* Live Status Pill & Simulation Controls */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={`badge text-uppercase px-2 py-1 ${
            activeStage === 'delivered'
              ? 'bg-success text-white'
              : activeStage === 'out_for_delivery'
              ? 'bg-danger text-white'
              : 'bg-primary text-white'
          }`} style={{ fontSize: '0.7rem' }}>
            ● {activeStage.replace(/_/g, ' ')} ({Math.round(progress)}%)
          </span>

          {activeStage !== 'delivered' && (
            <div className="btn-group btn-group-sm">
              <button
                onClick={() => setIsAutoMoving(!isAutoMoving)}
                className={`btn btn-sm ${isAutoMoving ? 'btn-warning text-dark' : 'btn-outline-light'}`}
                style={{ fontSize: '0.7rem' }}
                title="Pause or Resume Live Driving Motion"
              >
                <i className={`bi ${isAutoMoving ? 'bi-pause-fill' : 'bi-play-fill'} me-1`}></i>
                {isAutoMoving ? 'Pause Movement' : 'Resume Drive'}
              </button>

              <button
                onClick={() => setSpeedMultiplier(prev => (prev === 1 ? 3 : prev === 3 ? 6 : 1))}
                className="btn btn-sm btn-outline-light"
                style={{ fontSize: '0.7rem' }}
                title="Simulation speed multiplier"
              >
                {speedMultiplier}x Speed
              </button>

              <button
                onClick={handleFastForwardToDestination}
                className="btn btn-sm btn-primary text-white"
                style={{ fontSize: '0.7rem' }}
                title="Fast forward van near customer doorstep"
              >
                <i className="bi bi-fast-forward-fill me-1"></i> Near Doorstep
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Status Stage Selector Toolbar */}
      <div className="bg-light p-2 border-bottom d-flex align-items-center justify-content-between overflow-auto gap-2" style={{ whiteSpace: 'nowrap' }}>
        <div className="d-flex align-items-center gap-1">
          <span className="small text-muted fw-bold me-1" style={{ fontSize: '0.7rem' }}>Simulate Stage on Map:</span>
          {[
            { id: 'placed', label: '1. Placed' },
            { id: 'processing', label: '2. Processing' },
            { id: 'shipped', label: '3. Shipped' },
            { id: 'out_for_delivery', label: '4. Out for Delivery' },
            { id: 'delivered', label: '5. Delivered' }
          ].map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectStage(s.id)}
              className={`btn btn-sm py-0 px-2 rounded-pill ${
                activeStage === s.id
                  ? 'btn-dark text-white fw-bold shadow-sm'
                  : 'btn-outline-secondary border-0 text-dark'
              }`}
              style={{ fontSize: '0.72rem' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="small text-muted d-none d-md-block" style={{ fontSize: '0.7rem' }}>
          GPS Telemetry: Lat 37.7749° N, Lng -122.4194° W • {lastPing}
        </div>
      </div>

      {/* 3. Real-Time Telemetry Metrics Strip */}
      <div className="p-3 bg-white border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div>
            <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Estimated Arrival</small>
            <span className="fs-5 fw-extrabold text-primary">
              {activeStage === 'delivered' ? 'Package Delivered' : `~${remainingMins} Mins`}
            </span>
          </div>

          <div className="border-start ps-3">
            <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Distance Remaining</small>
            <span className="fw-bold text-dark">
              {activeStage === 'delivered' ? '0.0 Miles' : `${remainingMiles} Miles`}
            </span>
          </div>

          <div className="border-start ps-3 d-none d-sm-block">
            <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Courier Queue</small>
            <span className={`badge ${activeStage === 'delivered' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} fw-bold`}>
              {activeStage === 'delivered' ? 'Delivered' : `${stopsRemaining} Stop${stopsRemaining > 1 ? 's' : ''} away`}
            </span>
          </div>
        </div>

        {/* Live Active Street Location Indicator */}
        <div className="text-sm-end small">
          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Current Courier Vehicle Position:</small>
          <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {getCurrentStreet(progress)}
          </span>
        </div>
      </div>

      {/* 4. DYNAMIC VECTOR SVG MAP CANVAS */}
      <div className="map-canvas-container position-relative" style={{ minHeight: '380px' }}>
        <svg
          viewBox="0 0 720 360"
          className="w-100 h-100"
          style={{ backgroundColor: '#e8edf3' }}
        >
          <defs>
            <pattern id="gridPatternDynamic" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5dde5" strokeWidth="0.8" />
            </pattern>
            <filter id="routeGlowDynamic" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Map Grid */}
          <rect width="720" height="360" fill="url(#gridPatternDynamic)" />

          {/* Green Park Region */}
          <rect x="250" y="30" width="130" height="80" rx="16" fill="#cbe4d4" opacity="0.85" />
          <text x="315" y="75" fill="#4a7c59" fontSize="10" fontWeight="600" textAnchor="middle">
            Presidio Green Park
          </text>

          {/* Water Inlet / Bay */}
          <path
            d="M 0 320 Q 200 300 450 340 T 720 310 L 720 360 L 0 360 Z"
            fill="#bdd7ee"
            opacity="0.8"
          />
          <text x="180" y="342" fill="#41729f" fontSize="10" fontWeight="600">
            Bay Waters Marina
          </text>

          {/* City Street Network */}
          <line x1="0" y1="80" x2="720" y2="80" stroke="#ffffff" strokeWidth="14" />
          <line x1="0" y1="80" x2="720" y2="80" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" />
          <text x="40" y="72" fill="#94a3b8" fontSize="9" fontWeight="600">Market Boulevard</text>

          <line x1="0" y1="180" x2="720" y2="180" stroke="#ffffff" strokeWidth="16" />
          <line x1="0" y1="180" x2="720" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="8 6" />
          <text x="40" y="172" fill="#94a3b8" fontSize="9" fontWeight="600">Grand Avenue Highway</text>

          <line x1="0" y1="280" x2="720" y2="280" stroke="#ffffff" strokeWidth="14" />
          <text x="40" y="272" fill="#94a3b8" fontSize="9" fontWeight="600">Evergreen Terrace Way</text>

          {/* Cross Streets */}
          <line x1="140" y1="0" x2="140" y2="360" stroke="#ffffff" strokeWidth="12" />
          <text x="146" y="25" fill="#94a3b8" fontSize="9" fontWeight="600">1st Street</text>

          <line x1="280" y1="0" x2="280" y2="360" stroke="#ffffff" strokeWidth="12" />
          <text x="286" y="25" fill="#94a3b8" fontSize="9" fontWeight="600">Innovation Way</text>

          <line x1="440" y1="0" x2="440" y2="360" stroke="#ffffff" strokeWidth="12" />
          <text x="446" y="25" fill="#94a3b8" fontSize="9" fontWeight="600">Pinecrest Ave</text>

          <line x1="580" y1="0" x2="580" y2="360" stroke="#ffffff" strokeWidth="12" />
          <text x="586" y="25" fill="#94a3b8" fontSize="9" fontWeight="600">Horizon St</text>

          {/* Neighborhood Building Blocks */}
          <rect x="156" y="96" width="108" height="68" rx="6" fill="#dde4ec" />
          <rect x="296" y="196" width="128" height="68" rx="6" fill="#dde4ec" />
          <rect x="456" y="96" width="108" height="68" rx="6" fill="#dde4ec" />
          <rect x="456" y="196" width="108" height="68" rx="6" fill="#dde4ec" />
          <rect x="156" y="196" width="108" height="68" rx="6" fill="#dde4ec" />

          {/* Base Planned Route */}
          <path
            d="M 80 80 C 220 100, 420 240, 640 280"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Dynamic Completed Route (Green) */}
          <path
            d="M 80 80 C 220 100, 420 240, 640 280"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset={Math.max(0, 600 - (progress * 6))}
          />

          {/* Dynamic Active Remaining Route (Animated Blue) */}
          {progress < 100 && (
            <path
              d="M 80 80 C 220 100, 420 240, 640 280"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              className="map-route-line-dashed"
            />
          )}

          {/* 1. ORIGIN DEPOT PIN: Apex Hub #4 (80, 80) */}
          <g transform="translate(80, 80)">
            <circle r="14" fill="#334155" />
            <circle r="6" fill="#ffffff" />
            <text x="0" y="-18" fill="#1e293b" fontSize="10" fontWeight="700" textAnchor="middle">
              🏭 Hub #4
            </text>
            <text x="0" y="-7" fill="#64748b" fontSize="8" textAnchor="middle">
              Dispatched
            </text>
          </g>

          {/* 2. DESTINATION PIN: Customer Home (640, 280) */}
          <g transform="translate(640, 280)">
            <circle r="18" fill={progress >= 100 ? '#10b981' : '#ef4444'} opacity="0.25" />
            <circle r="12" fill={progress >= 100 ? '#10b981' : '#ef4444'} />
            <circle r="5" fill="#ffffff" />
            <path d="M 0 -12 L 0 -22 L 18 -16 Z" fill={progress >= 100 ? '#10b981' : '#ef4444'} />
            <rect x="-85" y="-46" width="170" height="20" rx="4" fill="#ffffff" stroke="#e2e8f0" />
            <text x="0" y="-32" fill="#0f172a" fontSize="9" fontWeight="700" textAnchor="middle">
              {progress >= 100 ? '✓ Delivered at Doorstep' : `📍 ${destinationStreet.slice(0, 20)}`}
            </text>
          </g>

          {/* 3. DYNAMIC MOVING COURIER VAN MARKER */}
          <g transform={`translate(${vanPos.x}, ${vanPos.y})`} style={{ transition: 'transform 0.35s ease-out' }}>
            {/* Animated Pulsing Radar Rings */}
            <circle r="16" fill={progress >= 100 ? '#10b981' : '#3b82f6'} className="pulsing-radar-circle" />
            <circle r="18" fill={progress >= 100 ? '#10b981' : '#2563eb'} opacity="0.3" />
            <circle r="14" fill={progress >= 100 ? '#059669' : '#1d4ed8'} />

            {/* Van Icon Vector */}
            <g transform="translate(-8, -8) scale(0.7)">
              <path
                d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7H1V3zm15 2h3.5a1 1 0 0 1 .8.4l2.5 3.3a1 1 0 0 1 .2.6V10h-7V5zm-4 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"
                fill="#ffffff"
              />
            </g>

            {/* Dynamic Live Tag above Van */}
            <rect x="-70" y="-38" width="140" height="22" rx="6" fill="#1e293b" />
            <text x="0" y="-24" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
              {progress >= 100
                ? 'Package Delivered! ✓'
                : `🚚 En Route (${Math.round(progress)}% • ${remainingMiles} mi)`}
            </text>
            <polygon points="-4,-16 4,-16 0,-12" fill="#1e293b" />
          </g>
        </svg>

        {/* 5. Floating Courier Driver Info Card */}
        <div className="driver-floating-card">
          <div className="row align-items-center g-2">
            <div className="col-auto">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '42px', height: '42px', fontSize: '18px' }}
              >
                MC
              </div>
            </div>

            <div className="col">
              <div className="d-flex align-items-center gap-2">
                <strong className="text-dark small">Marcus Chen</strong>
                <span className="badge bg-warning-subtle text-dark" style={{ fontSize: '0.65rem' }}>
                  ★ 4.95 (1,280 deliveries)
                </span>
                <span className="badge bg-light text-secondary border small d-none d-sm-inline">
                  Electric Van #EV-884
                </span>
              </div>
              <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                Status: <strong className="text-primary">{getCurrentStreet(progress)}</strong>
              </small>
            </div>

            <div className="col-auto d-flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCalling(true);
                  setTimeout(() => setIsCalling(false), 3000);
                }}
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${isCalling ? 'btn-success' : 'btn-outline-primary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                <i className={`bi ${isCalling ? 'bi-telephone-outbound-fill' : 'bi-telephone-fill'} me-1`}></i>
                {isCalling ? 'Calling Courier...' : 'Call Driver'}
              </button>

              <button
                type="button"
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="btn btn-sm btn-light border rounded-pill px-3"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="bi bi-chat-text me-1"></i> Delivery Note
              </button>
            </div>
          </div>

          {/* Delivery Note Form Drawer */}
          {isEditingNote && (
            <form onSubmit={handleSaveNote} className="mt-2 pt-2 border-top">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Leave on front porch, gate code #1234"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                  Save Note
                </button>
              </div>
            </form>
          )}

          {!isEditingNote && deliveryNote && (
            <div className="mt-2 pt-2 border-top d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.72rem' }}>
              <i className="bi bi-info-circle text-primary"></i>
              <span><strong>Driver Drop-off Instruction:</strong> "{deliveryNote}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
