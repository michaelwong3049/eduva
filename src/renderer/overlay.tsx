import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef } from 'react';
import type { Position, ScreenshotRegion } from 'global';

function ScreenshotOverlay() {
  const [screenshotSrc, setScreenshotSrc] = useState("");
  const [startingPosition, setStartingPosition] = useState<Position>();
  const [rect, setRect] = useState<ScreenshotRegion>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const cropImage = (screenshotSrc: string, cropRegion: ScreenshotRegion) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) {
      console.error("no image found or no canvas found?");
      return;
    }

    // Get the actual image dimensions (the captured screenshot)
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Get the overlay/stage dimensions (what the user sees)
    const stageWidth = stageRef.current.clientWidth;
    const stageHeight = stageRef.current.clientHeight;

    // Calculate scale factors
    const scaleX = imgWidth / stageWidth;
    const scaleY = imgHeight / stageHeight;

    // Scale the crop region to match actual image coordinates
    const scaledLeft = cropRegion.left * scaleX;
    const scaledTop = cropRegion.top * scaleY;
    const scaledWidth = cropRegion.width * scaleX;
    const scaledHeight = cropRegion.height * scaleY;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      img,
      scaledLeft,      // Source x position (scaled)
      scaledTop,       // Source y position (scaled)
      scaledWidth,     // Source width (scaled)
      scaledHeight,    // Source height (scaled)
      0,               // Destination x
      0,               // Destination y
      scaledWidth,     // Destination width
      scaledHeight     // Destination height
    );

    return canvas.toDataURL('image/png');
  }

  const handleDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (screenshotSrc === "") {
      console.warn("handleDown(): there is no screenshot?");
      return;
    }

    console.log("soemthing?");
    // const { x, y } = await window.nativeBits.getMousePosition();
    const bounds = stageRef.current.getBoundingClientRect();
    const startX = e.clientX - bounds.left;
    const startY = e.clientY - bounds.top;
    setStartingPosition({ x: startX, y: startY });
  }

  const handleMove = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (screenshotSrc === "" || !startingPosition) {
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

    if (screenshotSrc === "" || !rect) {
      return;
    }

    // Ignore tiny selections (accidental clicks)
    if (Math.abs(rect.width) < 5 || Math.abs(rect.height) < 5) {
      setRect(null);
      return;
    }

    try {
      const croppedDataUrl = cropImage(screenshotSrc, rect);
      window.nativeBits.sendToMain(croppedDataUrl);

      // console.log('Cropped image:', croppedDataUrl);

      // TODO: Do something with the cropped image
      // e.g., send to main process, copy to clipboard, etc.

    } catch (err) {
      console.error('Crop failed:', err);
    }

    // Clear the selection rectangle
    setRect(null);
    setStartingPosition(undefined);
  }

  useEffect(() => {
    window.nativeBits.onScreenshotCaptured((dataURL) => {
      console.log("screenshot being captured?")
      setScreenshotSrc(dataURL);
    })
  }, [])

  useEffect(() => {
    console.log("new screenshot", screenshotSrc);
  }, [screenshotSrc])

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
          ref={rectRef}
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
      <canvas 
        ref={canvasRef}
        style={{
          border: "4px solid black"
        }}
      />
      <img
        ref={imageRef}
        style={{ // border: "4px solid red",
          display: "none",
          width: "100%",
          height: "100%"
        }}
        src={screenshotSrc}/>
    </div>
  )
}

createRoot(document.body).render(<ScreenshotOverlay />);
