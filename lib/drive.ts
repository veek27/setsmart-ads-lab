import { google } from "googleapis";
import { Readable } from "stream";
import { supabaseAdmin } from "./supabase";

async function getRefreshToken(): Promise<string> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("oauth_tokens")
    .select("refresh_token")
    .eq("provider", "google")
    .maybeSingle();
  if (error) throw new Error(`DB error: ${error.message}`);
  if (!data?.refresh_token) {
    throw new Error(
      "Google not connected. Click 'Connect Google' on the dashboard first."
    );
  }
  return data.refresh_token;
}

async function getDrive() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET"
    );
  }
  const refreshToken = await getRefreshToken();

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2 });
}

export async function isGoogleConnected(): Promise<boolean> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from("oauth_tokens")
      .select("provider")
      .eq("provider", "google")
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function createBatchFolder(
  parentFolderId: string,
  batchDate: string
): Promise<{ folderId: string; folderUrl: string }> {
  const drive = await getDrive();
  const res = await drive.files.create({
    requestBody: {
      name: `SetSmart Ads — ${batchDate}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, webViewLink",
  });
  if (!res.data.id) throw new Error("Failed to create batch folder");
  return {
    folderId: res.data.id,
    folderUrl: res.data.webViewLink || "",
  };
}

export async function createSubfolder(
  parentFolderId: string,
  name: string
): Promise<{ folderId: string; folderUrl: string }> {
  const drive = await getDrive();
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, webViewLink",
  });
  if (!res.data.id) throw new Error(`Failed to create subfolder ${name}`);
  return {
    folderId: res.data.id,
    folderUrl: res.data.webViewLink || "",
  };
}

export async function uploadPng(
  parentFolderId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const drive = await getDrive();
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [parentFolderId],
    },
    media: {
      mimeType: "image/png",
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
  });
  return res.data.webViewLink || "";
}
