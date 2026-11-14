/**
 * Scuderia Language Studio — Host Central Storage Server (Google Apps Script)
 * 호스트의 Google Drive에 모든 학습자의 아이디별 데이터를 중앙 저장·관리합니다.
 *
 * [설치 방법]
 * 1. Google Apps Script에서 새 프로젝트 생성 후 아래 코드 붙여넣기
 * 2. HOST_PASSCODE 값을 호스트 전용 비밀번호로 변경 (기본값: scuderia_host_2026)
 * 3. [배포] -> [새 배포] -> 유형: [웹 앱]
 *    - 다음 사용자 권한으로 실행: 나(호스트)
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 * 4. 발급된 웹 앱 URL을 웹앱의 [호스트 중앙 서버] 설정에 입력하면 모든 사용자 데이터가 호스트 Drive에 저장됩니다.
 */

const HOST_FOLDER_NAME = "Scuderia_Host_Central_Student_DB";
const HOST_PASSCODE = "scuderia_host_2026";

function getOrCreateHostFolder() {
  const folders = DriveApp.getFoldersByName(HOST_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(HOST_FOLDER_NAME);
}

function sanitizeUserId(uid) {
  return String(uid || "guest").replace(/[^a-zA-Z0-9._@-]/g, "_").slice(0, 80);
}

function safeParseJson(text) {
  return JSON.parse(text, function (key, value) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return undefined;
    }
    return value;
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "load";
    const folder = getOrCreateHostFolder();

    if (action === "list_users") {
      const key = String((e && e.parameter && e.parameter.adminKey) || "");
      if (!key || key !== HOST_PASSCODE) {
        return jsonResponse({ ok: false, error: "Unauthorized" });
      }
      const files = folder.getFiles();
      const users = [];
      while (files.hasNext()) {
        const f = files.next();
        if (f.getName().endsWith(".json")) {
          try {
            const content = safeParseJson(f.getBlob().getDataAsString());
            users.push({
              fileName: f.getName(),
              userId: String(content.userId || f.getName().replace(".json", "")),
              email: String(content.email || ""),
              updatedAt: String(content.updatedAt || f.getLastUpdated().toISOString()),
              enDay: Number((content.en && content.en.currentDay) || 1),
              jaDay: Number((content.ja && content.ja.currentDay) || 1)
            });
          } catch (err) {}
        }
      }
      users.sort(function (a, b) {
        return String(b.updatedAt).localeCompare(String(a.updatedAt));
      });
      return jsonResponse({ ok: true, users: users });
    }

    const userId = sanitizeUserId(e && e.parameter && e.parameter.userId);
    const fileName = "student_" + userId + ".json";
    const files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      return jsonResponse({ ok: true, found: false, userId: userId, data: null });
    }
    const file = files.next();
    const data = safeParseJson(file.getBlob().getDataAsString());
    return jsonResponse({ ok: true, found: true, userId: userId, data: data });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const bodyText = e && e.postData && e.postData.contents;
    if (!bodyText) return jsonResponse({ ok: false, error: "Empty body" });
    if (bodyText.length > 2000000) return jsonResponse({ ok: false, error: "Payload too large" });

    const payload = safeParseJson(bodyText);
    const userId = sanitizeUserId(payload.userId);
    if (!userId) return jsonResponse({ ok: false, error: "Invalid userId" });

    const folder = getOrCreateHostFolder();
    const fileName = "student_" + userId + ".json";
    const record = {
      userId: userId,
      email: String(payload.email || "").slice(0, 120),
      updatedAt: new Date().toISOString(),
      en: payload.en || null,
      ja: payload.ja || null
    };
    const serialized = JSON.stringify(record, null, 2);

    const files = folder.getFilesByName(fileName);
    if (files.hasNext()) {
      const file = files.next();
      file.setContent(serialized);
    } else {
      folder.createFile(fileName, serialized, MimeType.PLAIN_TEXT);
    }
    return jsonResponse({ ok: true, userId: userId, savedAt: record.updatedAt });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}
