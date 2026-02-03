import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { getImageDimensions } from '../utils';

import { nanoid } from 'nanoid';
import { z } from 'zod';

import Chatbox from './components/chatbox';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import '@excalidraw/excalidraw/index.css';

import type { ExcalidrawDiamondElement, ExcalidrawEllipseElement, ExcalidrawImageElement, ExcalidrawRectangleElement, ExcalidrawSelectionElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import { ExcalidrawShapeOutputSchema } from 'src/types';
import { exportToBlob } from '@excalidraw/excalidraw';

export default function WhiteboardOverlay() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [screenshotSrc, setScreenshotSrc] = useState<string>("");

  const addScreenshotToWhiteboard = async () => {
    if (!excalidrawAPI) {
      console.error("error: no excalidrawAPi attatched?");
      return;
    }

    if (!screenshotSrc) {
      console.error("error: no screenshot attatched?");
      return;
    }

    // turn the screenshotSrc into a File type
    const { width, height } = await getImageDimensions(screenshotSrc);

    const response = await fetch(screenshotSrc);
    const blob = await response.blob();

    const imageFile = new File([blob], "screenshot");
    const imageFileId = nanoid();

    const id = nanoid();
    const elements = excalidrawAPI.getSceneElements();
    const nextIndex = (elements?.length ?? -1) + 1;

    const screenshotElement: ExcalidrawImageElement = {
      id: id,
      index: null, // TOOD: probably wrong, should use nextIndex?

      // base _ExcalidrawElementBase
      x: 500,
      y: 250,
      width: width,
      height: height,
      angle: 0,

      // base props
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: Math.floor(Math.random() * 2 ** 31),
      version: 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      isDeleted: false,
      boundElements: null,
      updated: Date.now(),
      link: null,
      locked: false,

      // ExcalidrawImageElement properties
      type: "image",
      fileId: imageFileId as any, // TODO: fix any type?
      status: "saved",
      scale: [1, 1],
      crop: null
    }

    excalidrawAPI.addFiles([{
      mimeType: "image/png", // TODO: this should be based on blob.type || "image/png"
      id: imageFileId as any,
      dataURL: screenshotSrc as any,
      created: Date.now()
    }]);

    const currentElements = excalidrawAPI.getSceneElements();
    excalidrawAPI.updateScene({
      elements: [...currentElements, screenshotElement]
    })

    console.log(excalidrawAPI.getSceneElements());
  }

  useEffect(() => {
    return window.nativeBits.onRequestWhiteboardData(async () => {
      if (!excalidrawAPI) {
        console.error("no excalidrawAPI when requesting for screenshot");
      }

      try {
        const blob = await exportToBlob({
          elements: excalidrawAPI.getSceneElements(),
          files: excalidrawAPI.getFiles(),
          mimeType: 'image/png',
        });

        const elements = excalidrawAPI.getSceneElements();

        // Convert blob to base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            console.error("Error sending screenshot: reader.result is type ArrayBuffer");
            return;
          }

          let result = reader.result;
          result = result.replace(/^data:image\/\w+;base64,/, '');

          window.nativeBits.sendWhiteboardDataResponse({
            elements: elements,
            screenshot: result as string
          });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to export whiteboard:', error);
        window.nativeBits.sendWhiteboardDataResponse(null);
      }
    })
  }, [excalidrawAPI])

  useEffect(() => {
    if (!excalidrawAPI || !screenshotSrc) {
      return;
    }

    (async () => {
      await addScreenshotToWhiteboard();
    })();
  }, [screenshotSrc, excalidrawAPI])

  useEffect(() => {
    window.nativeBits.onScreenshotCaptured((dataURL) => {
      setScreenshotSrc(dataURL);
    })
  }, [])

  useEffect(() => {
    return window.nativeBits.onAddShape((element: z.infer<typeof ExcalidrawShapeOutputSchema>) => {
      if (!excalidrawAPI) {
        // console.error("Cannot add shape: excalidrawAPI not ready");
        throw new Error("Cannot add shape: excalidrawAPI not ready");
      }

      // Create a full Excalidraw element from the shape data
      const shape = {
        ...element,
        index: null,
        groupIds: [],
        frameId: null,
        seed: Math.floor(Math.random() * 2 ** 31),
        version: 1,
        versionNonce: Math.floor(Math.random() * 2 ** 31),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
      } as ExcalidrawEllipseElement | ExcalidrawDiamondElement | ExcalidrawRectangleElement

      const currentElements = excalidrawAPI.getSceneElements();
      try {
        excalidrawAPI.updateScene({
          elements: [...currentElements, shape]
        });
      } catch (error) {
        console.error("Error updating scnee: ", error);
      }

      console.log("Added shape to whiteboard:", element);
    });
  }, [excalidrawAPI])

  useEffect(() => { 
    if (excalidrawAPI) {
      console.log("scene elements: ", excalidrawAPI.getSceneElements());
    }
  }, [])

  useEffect(() => {
    console.log("Screenshot: ", screenshotSrc);
  }, [])

  return (
      <div 
        style={{
          display: 'flex',
          position: 'relative',
          border: '2px solid black',
          borderRadius: '15px',
          width: '90%',
          height: '90%',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
        </div>
        <Chatbox />
      </div>
  )
}

createRoot(document.body).render(<WhiteboardOverlay />);
