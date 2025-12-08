import React, { useEffect, useState } from "react";
import { socket } from "../socket";

const ChatBox = ({ currentUserId, otherUserId, onClose }) => {
  const [messages, setMessages] = useState([]);   // { from, to, text, created_at }
  const [text, setText] = useState("");

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    // Conectamos el socket si aún no está conectado
    if (!socket.connected) {
      socket.connect();
    }

    // Unirse a la sala (la sala se calcula en el servidor con ambos IDs)
    socket.emit("join_room", { userId: currentUserId, otherUserId });

    // Escuchar mensajes entrantes
    const handleReceive = (msg) => {
      // Solo agregamos si pertenece a este chat
      const isMine =
        (msg.from === currentUserId && msg.to === otherUserId) ||
        (msg.from === otherUserId && msg.to === currentUserId);

      if (isMine) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
      // No desconectamos el socket global para no romper otros usos
    };
  }, [currentUserId, otherUserId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      from: currentUserId,
      to: otherUserId,
      text: text.trim(),
    };

    // Enviar al servidor
    socket.emit("send_message", payload);

    // Opcional: lo agregas localmente para que se vea "instantáneo"
    setMessages((prev) => [
      ...prev,
      { ...payload, created_at: new Date().toISOString() },
    ]);

    setText("");
  };

  return (
    <div className="chatbox">
      <div className="chatbox__header">
        <span>Chat con el vendedor</span>
        {onClose && (
          <button className="chatbox__close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="chatbox__messages">
        {messages.length === 0 && (
          <div className="chatbox__empty">Empieza la conversación ✨</div>
        )}

        {messages.map((msg, i) => {
          const mine = msg.from === currentUserId;
          return (
            <div
              key={i}
              className={`chatbox__message ${
                mine ? "chatbox__message--mine" : "chatbox__message--other"
              }`}
            >
              <div className="chatbox__bubble">{msg.text}</div>
              <div className="chatbox__time">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      <form className="chatbox__input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn--primary btn--sm">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
