import React from 'react';
import { Navigate } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  // Sheeba is not an event discovery directory per SRS Section 2.3/2.4
  return <Navigate to="/search" replace />;
};
