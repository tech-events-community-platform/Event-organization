import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Redirect to official share registration page
  return <Navigate to={`/events/${id}/register`} replace />;
};
