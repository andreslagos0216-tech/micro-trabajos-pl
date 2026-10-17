import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { ui } from "@/lib/ui";

export const metadata: Metadata = { title: "Regulamin" };

export default function Terms() {
  return (
    <LegalPage title="Regulamin">
      <section>
        <h2 className={ui.sectionTitle}>1. Postanowienia ogólne</h2>
        <p>Regulamin określa zasady korzystania z serwisu SC opcje, dostępnego pod adresem micro-trabajos-pl.vercel.app (dalej: „Serwis”). Operatorem Serwisu jest [NAZWA FIRMY], [ADRES], NIP [NIP], kontakt: [E-MAIL].</p>
        <p>Serwis jest platformą ogłoszeniową, która łączy osoby publikujące oferty pracy i usług z osobami, które je wykonują. Serwis nie jest agencją pracy, nie zatrudnia wykonawców i nie pośredniczy w zawieraniu umów o pracę.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>2. Konto użytkownika</h2>
        <p>Do publikowania ofert potrzebne jest konto. Logowanie odbywa się za pomocą jednorazowego linku wysyłanego na adres e-mail. Użytkownik odpowiada za bezpieczeństwo dostępu do swojej skrzynki pocztowej i podaje prawdziwe dane.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>3. Publikowanie ofert</h2>
        <p>Oferta musi opisywać rzeczywistą pracę lub usługę oraz podawać wynagrodzenie w złotych (PLN). Zabronione są oferty niezgodne z prawem, dyskryminujące ze względu na płeć, wiek, pochodzenie, wyznanie, orientację lub niepełnosprawność, oraz oferty wzywające do pracy bez wymaganych pozwoleń.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>4. Relacja między użytkownikami</h2>
        <p>Umowa o wykonanie pracy lub usługi zawierana jest bezpośrednio między stronami. Serwis nie odpowiada za jakość, terminowość ani zapłatę wynagrodzenia. Zalecamy spisanie warunków współpracy na piśmie.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>5. Wyróżnienie ogłoszeń i płatności</h2>
        <p>Wyróżnienie ogłoszenia kosztuje 19 zł brutto i trwa 7 dni od momentu płatności. Płatności obsługuje Stripe. Po aktywacji wyróżnienia zwrot jest możliwy tylko wtedy, gdy wynika to z przepisów prawa.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>6. Zgłaszanie treści</h2>
        <p>Każdy może zgłosić ogłoszenie naruszające regulamin, korzystając z przycisku „Zgłoś” przy ofercie. Operator sprawdza zgłoszenie bez zbędnej zwłoki i może usunąć treść lub zawiesić konto. O decyzji informuje zgłaszającego i autora treści, podając powód.</p>
      </section>

      <section>
        <h2 className={ui.sectionTitle}>7. Zawieszenie i usunięcie konta</h2>
        <p>Użytkownik może w każdej chwili usunąć konto. Operator może zawiesić konto w razie naruszenia regulaminu lub przepisów prawa.</p>
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
        <p>Regulamin podlega prawu polskiemu. Operator może zmienić regulamin; o istotnych zmianach poinformuje użytkowników z wyprzedzeniem, a dalsze korzystanie z Serwisu oznacza ich akceptację.</p>
      </section>
    </LegalPage>
  );
}
