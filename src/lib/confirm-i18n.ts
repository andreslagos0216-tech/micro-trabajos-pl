import type { Lang } from "@/lib/i18n";

export type ConfirmDict = {
  gate: string;
  title: string;
  text: string;
  send: string;
  sending: string;
  sentOk: string;
  codePlaceholder: string;
  verify: string;
  verifying: string;
  errSend: string;
  errInvalid: string;
  errSession: string;
};

export const confirmText: Record<Lang, ConfirmDict> = {
  pl: {
    gate: "Aby publikować ogłoszenia, potwierdź swój adres e-mail. Znajdziesz go w żółtym pasku na górze strony.",
    title: "Potwierdź swój adres e-mail",
    text: "Konto działa, ale do publikowania ogłoszeń potrzebne jest potwierdzenie e-mail.",
    send: "Wyślij kod",
    sending: "Wysyłanie...",
    sentOk: "Kod wysłany. Sprawdź skrzynkę (także folder spam).",
    codePlaceholder: "Kod z e-maila",
    verify: "Potwierdź",
    verifying: "Sprawdzanie...",
    errSend: "Nie udało się wysłać kodu. Spróbuj ponownie za kilka minut.",
    errInvalid: "Kod jest nieprawidłowy lub wygasł. Wyślij nowy.",
    errSession: "Zaloguj się ponownie.",
  },
  es: {
    gate: "Para publicar anuncios, confirma tu correo. Lo encontrarás en la barra amarilla de la parte superior.",
    title: "Confirma tu correo electrónico",
    text: "Tu cuenta ya funciona, pero para publicar anuncios necesitas confirmar el correo.",
    send: "Enviar código",
    sending: "Enviando...",
    sentOk: "Código enviado. Revisa tu bandeja (y la carpeta de spam).",
    codePlaceholder: "Código del correo",
    verify: "Confirmar",
    verifying: "Comprobando...",
    errSend: "No se pudo enviar el código. Inténtalo de nuevo en unos minutos.",
    errInvalid: "El código no es válido o ha caducado. Pide uno nuevo.",
    errSession: "Vuelve a iniciar sesión.",
  },
  en: {
    gate: "To publish listings, confirm your email. You'll find it in the yellow bar at the top of the page.",
    title: "Confirm your email address",
    text: "Your account works, but you need to confirm your email to publish listings.",
    send: "Send code",
    sending: "Sending...",
    sentOk: "Code sent. Check your inbox (and the spam folder).",
    codePlaceholder: "Code from the email",
    verify: "Confirm",
    verifying: "Checking...",
    errSend: "The code could not be sent. Please try again in a few minutes.",
    errInvalid: "The code is invalid or has expired. Request a new one.",
    errSession: "Please log in again.",
  },
};