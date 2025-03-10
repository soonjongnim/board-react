import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import './style.css'; // CSS styles (same as before)

interface ImageZoomProps {
  src: string;
  zoomSize?: number; // Optional zoom lens size (default: 150px)
}

// forwardRef를 사용하여 부모에서 ref 접근 가능하게 설정
const ImageZoom = forwardRef<HTMLImageElement, ImageZoomProps>(({ src, zoomSize = 150 }, ref) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const lensRef = useRef<HTMLDivElement | null>(null);
    const resultRef = useRef<HTMLDivElement | null>(null);
  
    const [cx, setCx] = useState<number>(1);
    const [cy, setCy] = useState<number>(1);
  
    useImperativeHandle(ref, () => imgRef.current!);
  
    useEffect(() => {
      const img = imgRef.current;
      const lens = lensRef.current;
      const result = resultRef.current;
  
      if (!img || !lens || !result) return;
  
      const updateZoom = () => {
        if (!imgRef.current || !resultRef.current || !lensRef.current) return;
        if (img.complete && img.width > 0 && img.height > 0) {

          // ✅ Ensure result div has a width & height before calculations
          if (result.clientWidth === 0 || result.clientHeight === 0) {
            console.log('result.clientWidth: ' + result.clientWidth);
            result.style.width = "400px"; // Default width
            result.style.height = "400px"; // Default height
            setTimeout(updateZoom, 500); // Recalculate zoom
            return;
          }
          
          const resultWidth = result.clientWidth;
          const resultHeight = result.clientHeight;
          console.log('resultWidth: ' + resultWidth);
          console.log('resultHeight: ' + resultHeight);
          const lensWidth = lens.clientWidth;
          const lensHeight = lens.clientHeight;
          console.log('lensWidth: ' + lensWidth);
          console.log('lensHeight: ' + lensHeight);
          setCx(resultWidth / lensWidth);
          setCy(resultHeight / lensHeight);
          console.log('cx: ' + (resultWidth / lensWidth));
          console.log('cy: ' + (resultHeight / lensHeight));
          result.style.backgroundImage = `url(${img.src})`;
          result.style.backgroundSize = `${img.width * (resultWidth / lensWidth)}px 
                                          ${img.height * (resultHeight / lensHeight)}px`;
          console.log('result.style.backgroundSize: ' + `${img.width * (resultWidth / lensWidth)}px
                                                          ${img.height * (resultHeight / lensHeight)}px`);
        }
      };
  
      const handleLoad = () => {
        setTimeout(updateZoom, 200); // Ensure recalculation after render
      };
  
      img.addEventListener("load", handleLoad);
      window.addEventListener("resize", updateZoom);
      
      return () => {
        img.removeEventListener("load", handleLoad);
        window.removeEventListener("resize", updateZoom);
      };
    }, [src, zoomSize]);
  
    const moveLens = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      
      const img = imgRef.current;
      const lens = lensRef.current;
      const result = resultRef.current;
      if (!img || !lens || !result) return;
  
      const rect = img.getBoundingClientRect();
      const pos = getCursorPos(event, rect);
  
      let x = pos.x - lens.offsetWidth / 2;
      let y = pos.y - lens.offsetHeight / 2;
  
      x = Math.max(0, Math.min(x, img.width - lens.offsetWidth));
      y = Math.max(0, Math.min(y, img.height - lens.offsetHeight));
  
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
    };
  
    const getCursorPos = (event: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
      let x, y;
      if ("touches" in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }
      return { x, y };
    };
  
    return (
      <div className="image-zoom-container">
        <div className="img-wrap" onMouseMove={moveLens} onTouchMove={moveLens}>
          <img ref={imgRef} src={src} alt="Zoom" className="zoom-image" />
          <div ref={lensRef} className="zoom-lens" style={{ width: zoomSize, height: zoomSize }}></div>
        </div>
        <div ref={resultRef} className="zoom-result"></div>
      </div>
    );
  });
  
  export default ImageZoom;