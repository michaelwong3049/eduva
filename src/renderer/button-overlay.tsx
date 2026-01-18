import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

export default function WhiteboardButtonOverlay() {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 3 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    return () => clearTimeout(exitTimer);
  }, []);

  const handleAnimationEnd = () => {
    if (isExiting) {
      window.nativeBits.closeWhiteboardOverlay();
    }
  };

  return (  
    <>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }
      `}</style>
      <div
        onAnimationEnd={handleAnimationEnd}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          fontWeight: 500,
          borderRadius: "25px",
          padding: "8px",
          backgroundColor: "#BCE7FD",
          animation: isExiting 
            ? "slideUp 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards"
            : "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      >
      </div>
    </>
  )
}

createRoot(document.body).render(<WhiteboardButtonOverlay />);
