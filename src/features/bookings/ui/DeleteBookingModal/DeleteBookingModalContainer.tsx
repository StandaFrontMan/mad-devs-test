import React, { useEffect } from 'react';
import { DeleteBookingModalView } from './DeleteBookingModalView';
import type { Booking } from '@/domain/booking';

export type DeleteBookingModalContainerProps = {
  isOpen: boolean;
  booking: Booking | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
};

export const DeleteBookingModalContainer: React.FC<DeleteBookingModalContainerProps> = ({
  isOpen,
  booking,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  const handleConfirm = () => {
    if (booking && !isDeleting) {
      onConfirm(booking);
    }
  };

  return (
    <DeleteBookingModalView
      isOpen={isOpen}
      booking={booking}
      isDeleting={isDeleting}
      onClose={onClose}
      onConfirm={handleConfirm}
    />
  );
};
