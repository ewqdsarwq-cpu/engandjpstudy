# Scuderia Language Studio (Apple x Ferrari Edition)

영어 공부 페이지(Page 1)와 일본어 공부 페이지(Page 2)를 하나로 묶은 1시간 학습 & 복습 스튜디오입니다.

## 파일 구성
- `index.html`: 통합 메인 웹앱 (상단 버튼으로 영어 페이지 / 일본어 페이지 즉시 전환)
- `english.html`: 영어 공부 전용 페이지 (Page 1)
- `japanese.html`: 일본어 공부 전용 페이지 (Page 2)
- `manifest.json`: 웹앱 메타데이터
- `.nojekyll`: GitHub Pages 정적 호스팅 설정
- `.github/workflows/deploy.yml`: GitHub Pages 자동 배포 워크플로우

## GitHub 웹 배포 방법
1. GitHub에서 새 Public 저장소를 생성합니다.
2. 이 폴더의 모든 파일을 업로드하고 Commit changes를 누릅니다.
3. 저장소 Settings -> Pages에서 Source를 Deploy from a branch (main / root) 또는 GitHub Actions로 선택하면 웹 주소가 생성됩니다.
