import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { ui } from "@/lib/ui";
import { legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Polityka prywatności" };

export default function Privacy() {
  return (
    <LegalPage title="Polityka prywatności">
      <section>
        <h2 className={ui.sectionTitle}>1. Administrator danych</h2>
        <p>Administratorem danych jest {legal.operatorName}, {legal.operatorType}, adres: {legal.address}, kontakt: {legal.email}.</p>
        <p>Administrator nie wyznaczył inspektora ochrony danych. Sprawy dotyczące danych osobowych należy kierować na adres {legal.email}.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>2. Jakie dane zbieramy</h2>
        <p>Adres e-mail (do logowania i powiadomień), imię i nazwisko lub nazwa wyświetlana, miejscowość, numer telefonu (wyłącznie jeśli sam go podasz), treść ogłoszeń i wiadomości, dane dotyczące płatności za wyróżnienie ogłoszeń oraz dane techniczne niezbędne do działania Serwisu.</p>
        <p>Serwis nie zbiera dokumentów tożsamości. Jeśli w przyszłości wprowadzimy weryfikację, poinformujemy o tym osobno.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>3. Cele i podstawy prawne</h2>
        <p>Dane przetwarzamy w celu: umożliwienia korzystania z konta i publikowania ogłoszeń (art. 6 ust. 1 lit. b RODO), obsługi płatności i wypełniania obowiązków podatkowych (art. 6 ust. 1 lit. c RODO), zapewnienia bezpieczeństwa i obsługi zgłoszeń (art. 6 ust. 1 lit. f RODO) oraz – gdy wyrazisz zgodę – w innych celach wskazanych w momencie zgody (art. 6 ust. 1 lit. a RODO).</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>4. Odbiorcy danych</h2>
        <p>Dane mogą być powierzone dostawcom, którzy świadczą usługi na rzecz Serwisu: Supabase (baza danych i uwierzytelnianie), Vercel (hosting), Resend (wysyłka wiadomości e-mail) oraz Stripe (płatności). Stripe przetwarza dane płatnicze we własnym zakresie; Serwis nie przechowuje numerów kart.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>5. Okres przechowywania</h2>
        <p>Dane konta przechowujemy do czasu jego usunięcia. Dane dotyczące płatności przechowujemy przez okres wymagany przepisami podatkowymi i rachunkowymi. Ogłoszenia usuwamy wraz z kontem lub na żądanie autora.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>6. Twoje prawa</h2>
        <p>Masz prawo do dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>7. Pliki cookies</h2>
        <p>Serwis używa wyłącznie plików niezbędnych do działania logowania i wyboru języka. Nie stosujemy plików reklamowych ani śledzących bez Twojej wyraźnej zgody.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>8. Zmiany polityki</h2>
        <p>Możemy aktualizować tę politykę. Nową wersję opublikujemy w Serwisie, a w razie istotnych zmian poinformujemy użytkowników. Ostatnia aktualizacja: {legal.lastUpdate}.</p>
      </section>
    </LegalPage>
  );
}