import React from "react";

export const ConfimationPopup = ({ isOpen, onClose, onConfirm, message, button = {} }) => {
    if (!isOpen) return null;
    if (!("color" in button)) {
        button = { ...button, color: "bg-red-500" };
    }
    if (!("message" in button)) {
        button = { ...button, message: "Confirm" };
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
                <p>{message}</p>
                <div className="flex justify-end mt-4">
                    <button
                        className="bg-gray-300 px-4 py-2 rounded mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`${button["color"]} text-white px-4 py-2 rounded`}
                        onClick={onConfirm}
                    >
                        {button["message"]}
                    </button>
                </div>
            </div>
        </div>
    );
};


export const Popup = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
        <h2 className="text-lg font-semibold mb-4">Message</h2>
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button
            className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-500"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};


export default ConfimationPopup;
