"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { geoText } from "@/lib/i18n-geo";
import { ui } from "@/lib/ui";

type InstallEvent = Event & { prompt: () => Promise<void> };

function readLang(): Lang {
  const m = document.cookie.match(/(?:^|; )lang=(es|en|pl)/);
  return (m?.[1] as Lang) ?? "pl";
}

export function InstallBanner() {
  const [lang, setLang] = useState<Lang>("pl");
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setLang(readLang());

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem("installDismissed") === "1";
    if (standalone || dismissed) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    setVisible(isIos);

    // Android / Chrome: el navegador avisa cuando la app se puede instalar
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible) return null;

  const t = geoText[lang];

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem("installDismissed", "1");
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label={t.installTitle}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="font-semibold text-slate-900 dark:text-slate-50">{t.installTitle}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {ios ? t.installIosSteps : t.installText}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={dismiss} className={ui.buttonSecondary}>
          {t.installDismiss}
        </button>
        {!ios && deferred && (
          <button type="button" onClick={install} className={ui.button}>
            {t.installButton}
          </button>
        )}
      </div>
    </div>
  );
}
