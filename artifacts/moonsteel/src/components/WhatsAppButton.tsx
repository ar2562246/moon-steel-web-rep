import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923312562246?text=Hi%2C%20I%27d%20like%20to%20request%20a%20quote%20from%20Moon%20Steel."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 md:hover:scale-105 md:transition-[transform,background-color]"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 relative z-10" />
    </a>
  );
}
