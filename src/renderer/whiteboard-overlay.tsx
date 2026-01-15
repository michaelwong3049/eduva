import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { getImageDimensions } from '../utils';

import { nanoid } from 'nanoid';

import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import '@excalidraw/excalidraw/index.css';
import { generateIdFromFile } from '@excalidraw/excalidraw/dist/types/excalidraw/data/blob';

import type { ExcalidrawImageElement } from '@excalidraw/excalidraw/dist/types/excalidraw/element/types';
import type { DataURL } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

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
      index: null, // TOOD: probably worng, should use nextIndex?

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
    console.log("Screenshot: ", screenshotSrc);
  }, [])

  return (
      <div 
        style={{
          border: "2px solid black",
          borderRadius: "15px",
          width: "90%",
          height: "90%",
          overflow: "hidden",
        }}
      >
        <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
      </div>
  )
}

createRoot(document.body).render(<WhiteboardOverlay />);
