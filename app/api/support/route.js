// Support form endpoint. Sends the request to the support inbox and an
// automatic reply to the merchant through Resend's email API.
// Needs three environment variables in Vercel:
//   RESEND_API_KEY  API key from resend.com
//   SUPPORT_TO      inbox that receives requests
//   SUPPORT_FROM    verified sender, e.g. "Oblique support <support@yourdomain.com>"

const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB.
const FILE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"];

const field = (form, name, max = 200) => String(form.get(name) ?? "").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function send(key, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export async function POST(request) {
  const { RESEND_API_KEY, SUPPORT_TO, SUPPORT_FROM } = process.env;
  if (!RESEND_API_KEY || !SUPPORT_TO || !SUPPORT_FROM) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // Bots fill every field; people never see this one.
  if (field(form, "company")) return Response.json({ ok: true });

  const data = {
    name: field(form, "name", 120),
    email: field(form, "email", 200),
    storeUrl: field(form, "store_url", 300),
    theme: field(form, "theme", 60) || "Oblique",
    subject: field(form, "subject", 150),
    message: field(form, "message", 8000),
  };

  const errors = {};
  if (!data.name) errors.name = "required";
  if (!isEmail(data.email)) errors.email = "invalid";
  if (!data.storeUrl) errors.store_url = "required";
  if (!data.subject) errors.subject = "required";
  if (data.message.length < 10) errors.message = "too_short";

  const files = form.getAll("files").filter((f) => typeof f === "object" && f.size > 0);
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > MAX_FILES || total > MAX_TOTAL_BYTES || files.some((f) => !FILE_TYPES.includes(f.type))) {
    errors.files = "invalid";
  }
  if (Object.keys(errors).length) return Response.json({ error: "invalid", fields: errors }, { status: 400 });

  const attachments = await Promise.all(
    files.map(async (f) => ({
      filename: f.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100) || "attachment",
      content: Buffer.from(await f.arrayBuffer()).toString("base64"),
    })),
  );

  const subjectLine = `[${data.theme}] ${data.subject}`;
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Store URL: ${data.storeUrl}`,
    `Theme: ${data.theme}`,
    `Attachments: ${attachments.length}`,
    "",
    data.message,
  ].join("\n");

  try {
    await send(RESEND_API_KEY, {
      from: SUPPORT_FROM,
      to: [SUPPORT_TO],
      reply_to: data.email,
      subject: subjectLine,
      text: body,
      attachments,
    });
    await send(RESEND_API_KEY, {
      from: SUPPORT_FROM,
      to: [data.email],
      subject: `We received your request: ${data.subject}`,
      text: [
        `Hi ${data.name},`,
        "",
        `Thanks for contacting ${data.theme} support. We've received your request and will reply to this address.`,
        "",
        "Your message:",
        data.message,
        "",
        "While you wait, the theme manual may already have the answer: https://oblique-manual.vercel.app/faq",
      ].join("\n"),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
