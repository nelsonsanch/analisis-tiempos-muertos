import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPanel from "./ChatPanel";

/**
 * Botón flotante que abre el panel del asistente IA
 */
export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Panel de chat */}
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Botón flotante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Abrir asistente IA</span>
        </Button>
      )}
    </>
  );
}
