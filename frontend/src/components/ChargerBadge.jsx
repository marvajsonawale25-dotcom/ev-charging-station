import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Wrench } from 'lucide-react';

export default function ChargerBadge({ status, charger }) {
  const currentStatus = status || charger?.status || 'AVAILABLE';

  switch (currentStatus) {
    case 'AVAILABLE':
      return (
        <span className="badge badge-available rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1">
          <CheckCircle2 size={13} /> Available
        </span>
      );
    case 'OCCUPIED':
      return (
        <span className="badge badge-occupied rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1">
          <AlertCircle size={13} /> Occupied
        </span>
      );
    case 'RESERVED':
      return (
        <span className="badge badge-reserved rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1">
          <Clock size={13} /> Reserved
        </span>
      );
    case 'MAINTENANCE':
    case 'OFFLINE':
    default:
      return (
        <span className="badge badge-maintenance rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1">
          <Wrench size={13} /> Maintenance
        </span>
      );
  }
}
