import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { ui } from "@/lib/ui";
import { legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Regulamin" };

export default function Terms() {
  return (
    <LegalPage title="Regulamin">
      <section>
        <h2 className={ui.sectionTitle}>1. Postanowienia ogólne</h2>
        <p>Regulamin określa zasady korzystania z serwisu {legal.brand}, dostępnego pod adresem {legal.domain} (dalej: „Serwis”). Operatorem Serwisu jest {legal.operatorName}, {legal.operatorType}, adres: {legal.address}, kontakt: {legal.email}.</p>
        <p>Serwis jest platformą ogłoszeniową, która łączy osoby publikujące oferty pracy, usług, sprzedaży i wynajmu z osobami zainteresowanymi. Serwis nie jest agencją pracy, nie zatrudnia wykonawców i nie pośredniczy w zawieraniu umów o pracę.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>2. Konto użytkownika</h2>
        <p>Do publikowania ogłoszeń potrzebne jest konto założone z adresem e-mail i hasłem. Użytkownik podaje prawdziwe dane i odpowiada za bezpieczeństwo swojego konta. Hasło może zmienić w każdej chwili lub odzyskać je za pomocą kodu wysłanego na adres e-mail.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>3. Publikowanie ogłoszeń</h2>
        <p>Ogłoszenie musi dotyczyć rzeczywistej pracy, usługi, sprzedaży lub wynajmu. Zabronione są ogłoszenia niezgodne z prawem, wprowadzające w błąd, dyskryminujące ze względu na płeć, wiek, pochodzenie, wyznanie, orientację lub niepełnosprawność, oraz ogłoszenia dotyczące pracy bez wymaganych zezwoleń.</p>
        <p>W ogłoszeniach dotyczących wynajmu zabronione jest żądanie zaliczek przed obejrzeniem lokalu oraz wymaganie płatności poza umową.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>4. Relacja między użytkownikami</h2>
        <p>Umowa o pracę, o wykonanie usługi, sprzedaży lub najmu zawierana jest bezpośrednio między stronami. Serwis nie odpowiada za jakość, terminowość, zapłatę ani stan przedmiotów i lokali. Zalecamy spisanie warunków współpracy na piśmie.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>5. Wyróżnienie ogłoszeń i płatności</h2>
        <p>Wyróżnienie ogłoszenia kosztuje 19 zł brutto i trwa 7 dni od momentu płatności. Płatności obsługuje Stripe. Zwrot jest możliwy tylko wtedy, gdy wynika to z przepisów prawa.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>6. Zgłaszanie treści</h2>
        <p>Każdy zalogowany użytkownik może zgłosić ogłoszenie przyciskiem zgłoś. Operator sprawdza zgłoszenie bez zbędnej zwłoki i może usunąć treść lub zawiesić konto. O decyzji informuje zgłaszającego i autora treści, podając powód.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>7. Zawieszenie i usunięcie konta</h2>
        <p>Użytkownik może w każdej chwili usunąć konto, kontaktując się z operatorem. Operator może zawiesić konto w razie naruszenia regulaminu lub przepisów prawa.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>8. Odpowiedzialność</h2>
        <p>Operator dokłada starań, aby Serwis działał bez przerw, nie gwarantuje jednak ciągłej dostępności. Odpowiedzialność operatora jest ograniczona w zakresie dozwolonym przez prawo.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>9. Dane osobowe</h2>
        <p>Zasady przetwarzania danych osobowych określa Polityka prywatności dostępna w Serwisie.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>10. Prawo właściwe i zmiany</h2>
        <p>Regulamin podlega prawu polskiemu. Operator może zmienić regulamin; o istotnych zmianach poinformuje użytkowników z wyprzedzeniem. Ostatnia aktualizacja: {legal.lastUpdate}.</p>
      </section>
    </LegalPage>
  );
}