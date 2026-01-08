import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, SyntheticEvent } from 'react';
import type { Position, ScreenshotRegion } from 'global.d.ts';

function ScreenshotOverlay() {
  const [screenshotSrc, setScreenshotSrc] = useState("");
  const [startingPosition, setStartingPosition] = useState<Position>();
  const stageRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<ScreenshotRegion>(null);

  const handleDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (screenshotSrc != "") {
      console.warn("handleDown(): there is no screenshot?");
      return;
    }

    // const { x, y } = await window.nativeBits.getMousePosition();
    const bounds = stageRef.current.getBoundingClientRect();
    const startX = e.clientX - bounds.left;
    const startY = e.clientY - bounds.top;
    setStartingPosition({ x: startX, y: startY });
  }

  const handleMove = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (screenshotSrc != "" || !startingPosition) {
      return;
    }

    // const { x, y } = await window.nativeBits.getMousePosition();
    const bounds = stageRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    setRect({
      left: startingPosition.x,
      top: startingPosition.y,
      width: x - startingPosition.x,
      height: y - startingPosition.y
    })
  }

  const handleUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("handleup")

    if (screenshotSrc != "") {
      return;
    }
  }

  useEffect(() => {
    window.nativeBits.onScreenshotCaptured((dataURL) => {
      setScreenshotSrc(dataURL);
    })
  }, [])

  return (
    <div
      ref={stageRef}
      // onClick={(e) => handleClick(e)}
      onMouseDown={(e) => handleDown(e)}
      onMouseMove={(e) => handleMove(e)}
      onMouseUp={(e) => handleUp(e)}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        border: '2px solid green',
        // backgroundColor: 'rgba(0, 0, 0, 0.3)', // semi-transparent overlay
      }}
    >
      {rect && (
        <div
          style={{
            position: "absolute",
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            border: "2px solid #111",
            background: "rgba(0,0,0,0.08)",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* <canvas ref={canvasRef} width="100%" height="100%" /> */}
      {/* <img
        style={{
          // border: "4px solid red",
          width: "100%",
          height: "100%"
        }}
        src={screenshotSrc} /> */}
    </div>
  )
}

createRoot(document.body).render(<ScreenshotOverlay />);