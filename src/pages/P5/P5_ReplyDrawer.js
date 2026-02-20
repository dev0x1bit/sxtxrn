import React, { useState, useEffect } from 'react';
import LaTeX from 'react-latex-next';
import './P5_ReplyDrawer.css';

const P5_ReplyDrawer = ({ isOpen, target, onClose, onSubmit }) => {
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (isOpen) setReplyText("");
  }, [isOpen]);

  return (
    <div className={`reply-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <span className="drawer-title">
          Respondiendo a: [{target?.autor || 'SISTEMA'}]
        </span>
        <span className="drawer-close" onClick={onClose}>[ X ]</span>
      </div>
      
      {/* 🚀 ACÁ ESTÁ LA MAGIA: Pasamos el texto COMPLETO sin cortar */}
      <div className="drawer-context math-render">
        <LaTeX>{target?.texto || ''}</LaTeX>
      </div>

      <div className="drawer-input-area">
        <textarea 
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          maxLength={666}
          placeholder="[ INGRESE MENSAJE AQUÍ... ]"
          autoFocus={isOpen}
        />
      </div>

      <div className="drawer-footer">
        <span className={`char-counter ${replyText.length === 666 ? 'maxed' : ''}`}>
          {replyText.length} / 666
        </span>
        <button 
          className="submit-reply-btn" 
          onClick={() => onSubmit(replyText)}
          disabled={replyText.trim().length === 0}
        >
          [ TRANSMITIR ]
        </button>
      </div>
    </div>
  );
};

export default P5_ReplyDrawer;