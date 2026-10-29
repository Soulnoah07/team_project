import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill text-success';
      case 'danger':
        return 'bi-exclamation-octagon-fill text-danger';
      case 'warning':
        return 'bi-exclamation-triangle-fill text-warning';
      default:
        return 'bi-info-circle-fill text-info';
    }
  };

  return (
    <div className="custom-toast-container">
      <div className="custom-toast shadow-lg">
        <i className={`bi ${getIcon(toastMessage.type)} fs-5`}></i>
        <div className="small fw-semibold">{toastMessage.message}</div>
      </div>
    </div>
  );
}
