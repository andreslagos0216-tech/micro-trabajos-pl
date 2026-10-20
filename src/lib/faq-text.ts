import type { Lang } from "@/lib/i18n";

type Faq = { q: string; a: string };

export const faqText: Record<Lang, { title: string; subtitle: string; items: Faq[] }> = {
  pl: {
    title: "Pytania i odpowiedzi",
    subtitle: "Wszystko, co warto wiedzieć przed skorzystaniem z TaskGo.",
    items: [
      { q: "Czym jest TaskGo?", a: "To platforma ogłoszeniowa, która łączy osoby szukające pomocy z osobami, które mogą ją wykonać: sprzątanie, odśnieżanie, przeprowadzki, opieka i drobne naprawy." },
      { q: "Czy TaskGo zatrudnia pracowników?", a: "Nie. TaskGo tylko przedstawia ogłoszenia. Umowę zawierają bezpośrednio obie strony, a serwis nie gwarantuje pracy ani wynagrodzenia." },
      { q: "Co się dzieje po wysłaniu zgłoszenia o personel?", a: "Zgłoszenie trafia do nas. Skontaktujemy się przez WhatsApp, aby dowiedzieć się szczegółów i znaleźć osoby z Twojej okolicy. Usługa jest bezpłatna dla zgłaszającego." },
      { q: "Jak uniknąć oszustwa?", a: "Nie wysyłaj pieniędzy przed wykonaniem pracy ani przed obejrzeniem towaru. Ustal godziny, zakres pracy i sposób zapłaty przed rozpoczęciem. Jeśli coś wydaje się podejrzane, zgłoś ogłoszenie przyciskiem Zgłoś." },
      { q: "Czy muszę mieć konto?", a: "Aby przeglądać ogłoszenia, nie. Aby publikować lub zgłaszać ogłoszenia, tak. Rejestracja zajmuje chwilę, a e-mail potwierdzasz później." },
      { q: "Ile kosztuje publikacja?", a: "Publikacja ogłoszeń jest bezpłatna. Możesz wyróżnić ogłoszenie za 19 zł, aby było widoczne wyżej przez 7 dni." },
      { q: "Co zrobić, jeśli ktoś narusza zasady?", a: "Użyj przycisku Zgłoś przy ogłoszeniu. Każde zgłoszenie jest sprawdzane, a ogłoszenia niezgodne z regulaminem są usuwane." },
    ],
  },
  es: {
    title: "Preguntas frecuentes",
    subtitle: "Todo lo que conviene saber antes de usar TaskGo.",
    items: [
      { q: "¿Qué es TaskGo?", a: "Es una plataforma de anuncios que conecta a personas que necesitan ayuda con quienes pueden hacerla: limpieza, quitar nieve, mudanzas, cuidado y pequeñas reparaciones." },
      { q: "¿TaskGo contrata trabajadores?", a: "No. TaskGo solo publica anuncios. El acuerdo lo hacen directamente las dos partes, y la plataforma no garantiza ni el trabajo ni el pago." },
      { q: "¿Qué pasa después de enviar una solicitud de personal?", a: "La solicitud llega a nuestro equipo. Te escribimos por WhatsApp para conocer los detalles y buscar personas de tu zona. El servicio es gratuito para quien lo solicita." },
      { q: "¿Cómo evito una estafa?", a: "No envíes dinero antes de que se haga el trabajo o de ver el producto. Acuerda antes las horas, el alcance y la forma de pago. Si algo parece sospechoso, usa el botón Denunciar del anuncio." },
      { q: "¿Necesito una cuenta?", a: "Para ver anuncios, no. Para publicar o denunciar, sí. El registro es rápido, y el correo lo confirmas después." },
      { q: "¿Cuánto cuesta publicar?", a: "Publicar es gratis. Puedes destacar un anuncio por 19 zł para que aparezca más arriba durante 7 días." },
      { q: "¿Qué hago si alguien incumple las normas?", a: "Usa el botón Denunciar en el anuncio. Cada denuncia se revisa, y los anuncios que no cumplen el reglamento se eliminan." },
    ],
  },
  en: {
    title: "Frequently asked questions",
    subtitle: "What you should know before using TaskGo.",
    items: [
      { q: "What is TaskGo?", a: "It is a listings platform that connects people who need help with people who can do it: cleaning, snow removal, moving, care and small repairs." },
      { q: "Does TaskGo hire workers?", a: "No. TaskGo only publishes listings. The agreement is made directly between both parties, and the platform does not guarantee the work or the payment." },
      { q: "What happens after I send a staff request?", a: "The request reaches our team. We contact you on WhatsApp to get the details and look for people in your area. The service is free for the person requesting it." },
      { q: "How do I avoid scams?", a: "Do not send money before the work is done or before you see the item. Agree on hours, scope and payment method beforehand. If something looks suspicious, use the Report button on the listing." },
      { q: "Do I need an account?", a: "To browse listings, no. To publish or report, yes. Signing up is quick, and you confirm your email afterwards." },
      { q: "How much does it cost to publish?", a: "Publishing is free. You can feature a listing for 19 zł to appear higher for 7 days." },
      { q: "What if someone breaks the rules?", a: "Use the Report button on the listing. Every report is reviewed, and listings that break the terms are removed." },
    ],
  },
};