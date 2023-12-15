import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { useBoardStore } from 'stores';

export default function BoardWrite() {

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const { title, setTitle } = useBoardStore();
  const { content, setContent } = useBoardStore();
  const { boardImageFileList, setBoardImageFileList } = useBoardStore();
  const { resetBoard } = useBoardStore();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    resetBoard();
  }, []);

  return (
    <div className='board-write-wrapper'>
      <div className='board-write-container'>
        <div className='board-write-box'>
          <div className='board-write-title-box'>
            <input className='board-write-title-input' type='text' placeholder='제목을 작성해주세요.' value={title} />
          </div>
          <div className='divider'></div>
          <div className='board-write-content-box'>
            <textarea ref={contentRef} className='board-write-content-textarea' placeholder='본문을 작성해주세요.' value={content} />
            <div className='icon-button'>
              <div className='icon image-box-light-icon'></div>
            </div>
            <input ref={imageInputRef} type='file' accept='image/*' style={{ display:'none' }} />
          </div>
          <div className='board-write-images-box'>
            <div className='board-write-image-box'>
              <img className='board-write-image' />
              <div className='icon-button image-close'>
                <div className='icon close-icon'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
