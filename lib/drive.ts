import { google } from "googleapis";
import { Readable } from "stream";

function getDrive() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Google credentials: set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY env vars"
    );
  }
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

export async function createBatchFolder(
  parentFolderId: string,
  batchDate: string
): Promise<{ folderId: string; folderUrl: string }> {
  const drive = getDrive();
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
  const drive = getDrive();
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
  const drive = getDrive();
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

export async function makeFolderShareable(folderId: string) {
  const drive = getDrive();
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });
}
