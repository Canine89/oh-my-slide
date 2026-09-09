# 제작 파일과 선택적인 로컬 참조

## GitHub에 포함되는 공통 파일

스킬 폴더 기준:

- `assets/starter/`: 고정된 npm 설정·HyperFrames 설정·Paperlogy 두 굵기와 라이선스·런타임 준비 스크립트.
- `assets/build-starter.mjs`: 새로 작성한 composition.mjs를 Lottie JSON과 HTML로 연결.
- `assets/build-reference.mjs`: 승인본의 글리프·키프레임 구현을 읽어볼 수 있는 코드 참고. 책별 카피와 장면을 새 작업에 그대로 복제하지 않는다.
- `scripts/seed_project.py`: 기본 모드는 위 공통 파일만 사용하며 로컬 프로젝트 폴더에 의존하지 않는다.

## GitHub에 포함하지 않는 자료

원본 표지·삽화·음원·완성 영상·이미지 접촉 시트·개별 캠페인 폴더는 로컬에만 보관한다. 아래 경로는 원래 작업 환경의 선택적인 참조이며 새 클론에는 없어도 된다. 자료가 없다는 이유로 기본 시작이나 새 제작을 중단하지 않는다.

저장소 루트 기준:

- 바로바로 파이썬: `projects/001-barobaro-python/videos/barobaro-python/`
- NEXT 에듀테크: `projects/002-next-edutech/videos/`
- 로컬 승인본 축소 영상: 스킬 `assets/reference.mp4`
- 로컬 장면 모음: 스킬 `assets/reference-contact.jpg`

`seed_project.py --reference`는 첫 번째 프로젝트가 로컬에 있을 때만 명시적으로 사용하는 재현 기능이다. 기본 제작 경로는 이 옵션을 쓰지 않는다.

## 재사용할 원리

바로바로 파이썬에서는 큰 글자·읽는 홀드·핵심 단어 연결을, NEXT에서는 표지의 밝은 지면과 검정 활자·원본 인물 마스크·자료에 근거한 카피를 참고했다. 특정 파랑/노랑 배색, 질문형 도입, 중앙 세 줄, 작은 상시 표지, 동일한 종료 장면을 공통 틀로 굳히지 않는다.

기존 음악의 승인은 해당 캠페인에만 적용한다. Funkee Monkeee, Cat Walk, Happy Home은 과거 선택의 예이며 스킬에 음악 파일을 포함하지 않는다. 새 작업은 [음악 선택 지침](music-selection.md)에 따라 현재 이용 조건과 독자·분위기를 확인한다.
