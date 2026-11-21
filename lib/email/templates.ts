import type { QuoteRequestInput } from "@/lib/quotes/schemas";

export type ContactEmailInput = { name: string; email: string; phone?: string; subject: string; message: string };

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
const text = (value?: string) => value?.trim() || "Not provided";
const row = (label: string, value: string) => `<tr><td class="label">${escapeHtml(label)}</td><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;

function shell(preview: string, heading: string, body: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"><title>${escapeHtml(heading)}</title><style>
  body{margin:0;background:#f4f0eb;color:#141315;font-family:Arial,sans-serif}.wrap{width:100%;padding:24px 12px}.card{max-width:640px;margin:auto;background:#fff;border-top:6px solid #7d1028}.brand{background:#fff;padding:18px 32px;text-align:center}.brand img{display:block;width:240px;max-width:100%;height:auto;margin:auto}.content{padding:32px}.preview{display:none;max-height:0;overflow:hidden}.eyebrow{color:#7d1028;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}h1{font-size:28px;line-height:1.2;margin:10px 0 18px}p{line-height:1.65}table{border-collapse:collapse;width:100%;margin:22px 0}td{border-top:1px solid #e8e1dc;padding:12px 0;vertical-align:top;line-height:1.5}.label{width:34%;padding-right:16px;color:#6a6064;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.footer{padding:20px 32px;background:#141315;color:#bdb6b8;font-size:12px;line-height:1.5}@media(max-width:600px){.wrap{padding:0}.content,.brand,.footer{padding:22px 18px}h1{font-size:24px}td{display:block;width:auto!important}.label{padding-bottom:4px;border-bottom:0}}
  </style></head><body><div class="preview">${escapeHtml(preview)}</div><div class="wrap"><div class="card"><div class="brand"><img src="cid:fes-logo" width="240" alt="Fiber &amp; Electric Solutions Ltd."></div><div class="content"><div class="eyebrow">FES Trinidad &amp; Tobago</div><h1>${escapeHtml(heading)}</h1>${body}</div><div class="footer">Fiber &amp; Electric Solutions Ltd. · Electrical and fiber-optic infrastructure</div></div></div></body></html>`;
}

export function contactBusinessTemplate(input: ContactEmailInput) {
  const html = shell(`New website message from ${input.name}`, "New contact-form message", `<p>A customer submitted the FES contact form.</p><table>${row("Name", input.name)}${row("Email", input.email)}${row("Phone", text(input.phone))}${row("Subject", input.subject)}${row("Message", input.message)}</table><p>Reply to this email to respond directly to the customer.</p>`);
  const plain = [`New contact-form message`, `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${text(input.phone)}`, `Subject: ${input.subject}`, "", input.message].join("\n");
  return { html, text: plain };
}

export function contactCustomerTemplate(input: ContactEmailInput) {
  return {
    html: shell("FES received your message", "Thank you for contacting FES", `<p>Hello ${escapeHtml(input.name)},</p><p>We have received your message about <strong>${escapeHtml(input.subject)}</strong>. A member of the FES team will review it and respond using the contact information you provided.</p><p>This acknowledgement confirms receipt by our mail service; it is not a quotation or service appointment.</p>`),
    text: `Hello ${input.name},\n\nWe have received your message about “${input.subject}”. A member of the FES team will review it and respond.\n\nThis acknowledgement is not a quotation or service appointment.\n\nFiber & Electric Solutions Ltd.`,
  };
}

export function quoteBusinessTemplate(input: QuoteRequestInput, reference: string) {
  const html = shell(`New quotation request ${reference}`, "New quotation request", `<p>A quotation request was stored successfully. Private photographs are intentionally excluded from this email.</p><table>${row("Reference", reference)}${row("Name", input.name)}${row("Email", text(input.email))}${row("Phone", text(input.phone))}${row("Preferred contact", input.preferredContact)}${row("Service", input.service)}${row("Location", input.location)}${row("Property type", input.propertyType)}${row("Timeframe", text(input.preferredTimeframe))}${row("Description", input.description)}${row("Additional notes", text(input.additionalNotes))}</table><p>Use the secure administration area to review the complete record.</p>`);
  const plain = [`New quotation request`, `Reference: ${reference}`, `Name: ${input.name}`, `Email: ${text(input.email)}`, `Phone: ${text(input.phone)}`, `Preferred contact: ${input.preferredContact}`, `Service: ${input.service}`, `Location: ${input.location}`, `Property type: ${input.propertyType}`, `Timeframe: ${text(input.preferredTimeframe)}`, "", input.description, "", "Private photographs are intentionally excluded. Review the secure administration area for the complete record."].join("\n");
  return { html, text: plain };
}

export function quoteCustomerTemplate(input: QuoteRequestInput, reference: string) {
  return {
    html: shell(`FES received quotation request ${reference}`, "Your quotation request was received", `<p>Hello ${escapeHtml(input.name)},</p><p>FES has securely recorded your request for <strong>${escapeHtml(input.service)}</strong>. Keep the reference below if you need to follow up.</p><table>${row("Reference", reference)}${row("Service", input.service)}${row("Location", input.location)}</table><p>The team will review your requirements before contacting you.</p>`),
    text: `Hello ${input.name},\n\nFES has securely recorded your request for ${input.service}.\nReference: ${reference}\nLocation: ${input.location}\n\nThe team will review your requirements before contacting you.\n\nFiber & Electric Solutions Ltd.`,
  };
}
