import { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, children }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div
        className="confirm-dialog"
        onClick={e => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{message}</p>
        {children}
        <div className="confirm-dialog__actions">
          <button
            onClick={onCancel}
            className="button button--ghost"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="button button--danger"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
