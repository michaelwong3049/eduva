import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { Position } from 'global.d.ts';

function App() {
  const [screenshotSrc, setScreenshotSrc] = useState("");
  const [startingPosition, setStartingPosition] = useState<Position>();
  const [endingPosition, setEndingPosition] = useState<Position>();

  const handleDown = async () => {
    if (screenshotSrc != "") {
      return;
    }

    const { x, y } = await window.nativeBits.getMousePosition();
    setStartingPosition({ x, y });

    // window.nativeBits.getMousePosition(({ startX, startY }: Position) => {
    //   setStartingPosition({ startX, startY });
    // })
  }

  const handleUp = async () => {
    if (screenshotSrc != "") {
      return;
    }

    const { x, y } = await window.nativeBits.getMousePosition();
    setEndingPosition({ x, y });
  }

  useEffect(() => {
    window.nativeBits.onScreenshotCaptured((dataURL) => {
      // setScreenshotSrc(dataURL);
    })
  }, [])

  useEffect(() => {
    if (startingPosition) {
      console.log("startingPostion: ", startingPosition.x, " ", startingPosition.y);
    }
    if (endingPosition) {
      console.log("endingPosition: ", endingPosition.x, " ", endingPosition.y);
    }
  }, [endingPosition]) // if endingPosition is changed, that means we have a new screenshot and a new area to crop

  return (
    <div
    >
      <div
        onMouseDown={handleDown}
        onMouseUp={handleUp}
        style={{
          border: '2px solid black',
          padding: '2px'
        }}
      >
        <img src={screenshotSrc} />
      </div>
    </div>
  )
}


createRoot(document.body).render(<App />);
