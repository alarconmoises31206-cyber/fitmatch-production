import React from 'react';

interface PayoutInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void,
}

const PayoutInitiationModal: React.FC<PayoutInitiationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  
  if (!isOpen) return null,

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Initiate Payout</h2>
        <p>Are you sure you want to initiate this payout?</p>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default PayoutInitiationModal;
