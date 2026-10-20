// Envía un correo al administrador con Resend. Si falta la clave, no hace nada.
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

export async function notifyAdmin(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "TaskGo <no-reply@taskgo.pl>", to: [to], subject, html }),
    });
  } catch {
    // Un fallo del correo no debe impedir guardar la solicitud
  }
}