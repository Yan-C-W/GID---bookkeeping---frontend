// src/api/n8n.js
const env = {
  PROCESS_URL: (import.meta.env.VITE_N8N_WEBHOOK_URL || "").trim(),
  ACTION_URL: (import.meta.env.VITE_N8N_ACTION_URL || "").trim(),
  API_KEY: (import.meta.env.VITE_N8N_API_KEY || "").trim(),
};

function withAuth(headers = {}) {
  // 如果调用方传了非对象（例如 null / ""），强制纠正
  const safeHeaders =
    headers && typeof headers === "object" && !Array.isArray(headers) ? headers : {};

  const out = {
    ...(env.API_KEY ? { "X-API-KEY": env.API_KEY } : {}),
    ...safeHeaders,
  };

  // 彻底清除非法 header 名称（空字符串/空白）
  for (const k of Object.keys(out)) {
    if (typeof k !== "string" || k.trim() === "") {
      delete out[k];
    }
  }
  return out;
}



/** 发送银行对账 + 发票（multipart）到 n8n */
export async function reconcile({
  bankFile,
  invoiceFiles = [],
  period,
  periodOption,
  emails = [],

}) {
  if (!env.PROCESS_URL) throw new Error("Missing VITE_N8N_WEBHOOK_URL");

  const fd = new FormData();
  if (bankFile) fd.append("bankStatement", bankFile);
  invoiceFiles.forEach((f, i) => fd.append(`invoice_${i}`, f));
  if (period?.from) fd.append("periodFrom", period.from);
  if (period?.to) fd.append("periodTo", period.to);
  if (periodOption) fd.append("periodOption", periodOption);
  if (emails?.length) fd.append("emails", JSON.stringify(emails));

  const res = await fetch(env.PROCESS_URL, {
    method: "POST",
    body: fd,
    headers: withAuth({ Accept: "application/json" }), // 不要手设 Content-Type
  });

  if (res.status === 204)
    return { matches: [], actions: [], executionId: undefined };
  if (!res.ok)
    throw new Error(`Reconcile failed ${res.status}: ${await res.text()}`);
  return res.json();
}

/** 行内操作（JSON） */
export async function triggerAction(payload) {
  if (!env.ACTION_URL) throw new Error("Missing VITE_N8N_ACTION_URL");
  const res = await fetch(env.ACTION_URL, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok)
    throw new Error(`Action failed ${res.status}: ${await res.text()}`);
  return res.json();
}
