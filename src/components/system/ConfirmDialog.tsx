import React from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog