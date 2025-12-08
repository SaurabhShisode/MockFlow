

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal = ({ open, onClose, onConfirm }: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 font-inter">
      <div className="bg-gray-900 p-6 rounded-xl border border-white/10 w-96 space-y-4">
        <h2 className="text-xl font-bold text-red-400">Delete Account</h2>

        <p className="text-gray-300 text-sm">
          This will permanently delete your account including all mocks and request logs.
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
