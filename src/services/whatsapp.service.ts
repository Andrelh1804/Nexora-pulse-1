/**
 * WHATSAPP ENTERPRISE SERVICE (Evolution API)
 * Real integration activates when EVOLUTION_API_URL + EVOLUTION_API_KEY are set.
 * Without credentials, returns realistic simulation data.
 *
 * Fase 2.7 — WhatsApp Enterprise
 * Evolution API: https://doc.evolution-api.com
 */

const EVOLUTION_API_URL = typeof process !== "undefined" ? process.env.EVOLUTION_API_URL : undefined;
const EVOLUTION_API_KEY = typeof process !== "undefined" ? process.env.EVOLUTION_API_KEY : undefined;

export const IS_REAL = !!EVOLUTION_API_URL && !!EVOLUTION_API_KEY;

export interface WhatsAppInstance {
  instanceName: string;
  status: "open" | "connecting" | "close";
  qrCode?: string;
  number?: string;
  profileName?: string;
  profilePicUrl?: string;
}

export interface WhatsAppMessage {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio" | "document";
  caption?: string;
}

export interface WhatsAppSendResult {
  key: { id: string; remoteJid: string };
  status: "sent" | "error";
  timestamp: number;
}

async function apiRequest<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${EVOLUTION_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(`Evolution API error: ${err.message ?? JSON.stringify(err)}`);
  }
  return res.json() as Promise<T>;
}

async function createInstance(instanceName: string, webhookUrl?: string): Promise<WhatsAppInstance> {
  if (IS_REAL) {
    return apiRequest<WhatsAppInstance>("POST", "/instance/create", {
      instanceName,
      qrcode: true,
      webhook: webhookUrl ? { url: webhookUrl, byEvents: true } : undefined,
    });
  }
  return {
    instanceName,
    status: "connecting",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  };
}

async function getInstanceStatus(instanceName: string): Promise<WhatsAppInstance> {
  if (IS_REAL) {
    return apiRequest<WhatsAppInstance>("GET", `/instance/connectionState/${instanceName}`);
  }
  return {
    instanceName,
    status: "open",
    number: "5511999990000",
    profileName: "Nexora Demo",
    profilePicUrl: "",
  };
}

async function sendTextMessage(instanceName: string, msg: WhatsAppMessage): Promise<WhatsAppSendResult> {
  if (IS_REAL) {
    return apiRequest<WhatsAppSendResult>("POST", `/message/sendText/${instanceName}`, {
      number: msg.number,
      text: msg.text,
    });
  }
  return {
    key: { id: `sim_msg_${Date.now()}`, remoteJid: `${msg.number}@s.whatsapp.net` },
    status: "sent",
    timestamp: Math.floor(Date.now() / 1000),
  };
}

async function sendMediaMessage(instanceName: string, msg: WhatsAppMessage): Promise<WhatsAppSendResult> {
  if (IS_REAL) {
    return apiRequest<WhatsAppSendResult>("POST", `/message/sendMedia/${instanceName}`, {
      number: msg.number,
      mediatype: msg.mediaType ?? "image",
      media: msg.mediaUrl,
      caption: msg.caption,
    });
  }
  return {
    key: { id: `sim_media_${Date.now()}`, remoteJid: `${msg.number}@s.whatsapp.net` },
    status: "sent",
    timestamp: Math.floor(Date.now() / 1000),
  };
}

async function getQRCode(instanceName: string): Promise<{ qrcode: string }> {
  if (IS_REAL) {
    return apiRequest<{ qrcode: string }>("GET", `/instance/connect/${instanceName}`);
  }
  return { qrcode: "Simulated QR Code — configure EVOLUTION_API_URL e EVOLUTION_API_KEY para ativar." };
}

async function deleteInstance(instanceName: string): Promise<void> {
  if (IS_REAL) {
    await apiRequest("DELETE", `/instance/delete/${instanceName}`);
  }
}

export default {
  createInstance, getInstanceStatus, sendTextMessage, sendMediaMessage,
  getQRCode, deleteInstance, IS_REAL,
};
