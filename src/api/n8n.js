// src/api/n8n.js
const env = {
  PROCESS_URL: (import.meta.env.VITE_N8N_WEBHOOK_URL || "").trim(),
  ACTION_URL: (import.meta.env.VITE_N8N_ACTION_URL || "").trim(),
  API_KEY: (import.meta.env.VITE_N8N_API_KEY || "").trim(),
  UPLOAD_URL: (import.meta.env.VITE_N8N_UPLOAD_URL || "").trim(),
  UPLOAD_BANK_URL: (import.meta.env.VITE_N8N_BANK_UPLOAD_URL || "").trim(),
};

function withAuth(headers = {}) {
  // 如果调用方传了非对象（例如 null / ""），强制纠正
  const safeHeaders =
    headers && typeof headers === "object" && !Array.isArray(headers)
      ? headers
      : {};

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

/** 上传单个 invoice（multipart）到 n8n：存储 + OCR +（可选）reconcile one， 暂时没有添加 sessionId 和 transactionId */

export async function uploadInvoice({ file, sessionId, transactionId }) {
  if (!env.UPLOAD_URL) throw new Error("Missing VITE_N8N_UPLOAD_URL");
  if (!file) throw new Error("No file selected");

  const fd = new FormData();
  fd.append("file", file); // ⚠️ file/data 取决于 n8n
  if (sessionId) fd.append("sessionId", sessionId);
  if (transactionId) fd.append("transactionId", transactionId);

  const res = await fetch(env.UPLOAD_URL, {
    method: "POST",
    body: fd,
    headers: withAuth({ Accept: "application/json" }),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Upload returned non-JSON: ${text?.slice(0, 200)}`);
  }
  if (!res.ok)
    throw new Error(
      data?.error?.message || data?.error || `Upload failed ${res.status}`,
    );
  return data;
}

/** 上传多个银行对账单（multipart）到 n8n：存储 + OCR */

export async function uploadBankStatements(files, { sessionId } = {}) {
  const url = (import.meta.env.VITE_N8N_UPLOAD_BANK_URL || "").trim();
  if (!url) throw new Error("Missing VITE_N8N_UPLOAD_BANK_URL");

  const list = Array.isArray(files) ? files : Array.from(files || []);
  if (!list.length) throw new Error("No bank statement files selected");

  const results = [];
  // 串行最稳：避免 n8n/Drive 并发限制 + 保证用户重复上传时顺序可控
  for (const file of list) {
    const fd = new FormData();
    fd.append("file", file); // ✅ binary key 固定为 file（与你 n8n 节点一致）
    if (sessionId) fd.append("sessionId", sessionId);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
      headers: withAuth({ Accept: "application/json" }),
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Bank upload returned non-JSON: ${text?.slice(0, 200)}`);
    }

    if (!res.ok)
      throw new Error(
        data?.error?.message || `Bank upload failed ${res.status}`,
      );
    results.push({ file, data });
  }
  return results;
}
