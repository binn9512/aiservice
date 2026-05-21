const API_BASE_URL = "http://localhost:5000";
// 백엔드 DB에 저장된 옷장 목록 가져오기
export async function fetchClosetItems() {
  const response = await fetch(`${API_BASE_URL}/api/closet`);

  if (!response.ok) {
    throw new Error("옷장 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}
// 사진을 백엔드로 업로드하기
export async function uploadClosetPhoto(file) {
  const formData = new FormData();

  formData.append("photo", file);
  formData.append("user_id", "user1");

  const response = await fetch(`${API_BASE_URL}/api/closet/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("사진 업로드에 실패했습니다.");
  }

  return response.json();
}
