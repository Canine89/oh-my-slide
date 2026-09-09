# 구현과 검증

## 새 프로젝트의 시작

새 독립 작업은 스킬에 포함된 `assets/starter/`의 공통 폰트·npm 설정·출력 연결만 준비한다. `npm ci`의 설치 후 스크립트가 고정된 npm 패키지에서 Lottie·GSAP 파일과 라이선스를 `assets/`에 복사한다. 기존 프로젝트 폴더나 완성 영상은 필요하지 않다. 이전 책의 장면·표지·플랫폼 아이콘·BGM은 기본으로 복사하지 않는다. `seed_project.py`는 기존 폴더를 덮어쓰지 않으며 복사 내역을 `PROJECT-SEED.json`에 남긴다.

```sh
python3 .agents/skills/book-kinetic-ad/scripts/seed_project.py --target projects/003-new-book/videos/main
cd projects/003-new-book/videos/main
npm ci
```

BRIEF에 새 책의 메시지와 연출 선택을 적고 [음악 선택 지침](music-selection.md)에 따라 BGM을 확보한다. `scripts/composition.mjs`에 새 장면의 Lottie `animation`과 `{src, volume}` 형태의 `audio`를 export한다. 의도한 무음이면 audio는 null이다. animation은 `ip:0`, 양수 `w/h/fr/op`, 실제 layers를 갖는다. 이미지 경로는 프로젝트 루트 기준이다.

`build-ad.mjs`는 이 데이터를 로컬 Lottie JSON과 HyperFrames HTML로 연결할 뿐, 카피·장면·곡을 결정하지 않는다. 미작성 animation이나 없는 음원 경로는 빌드 오류로 알려 준다. 새 카피와 동작을 작성한 뒤 다음을 실행한다.

```sh
npm run build
npm run check
npm run render
npm run dev
```

동작 구현 참고가 필요하면 승인 생성기의 글리프·마스크·키프레임 유틸리티를 읽되 장면 좌표와 순서를 새 기획에 맞춘다. **승인본 자체의 기술 재현**을 명시적으로 원하는 때만 아래 모드를 쓴다. 이 모드는 이전 캠페인과 음원까지 복사하는 참조 복제본이다. 로컬에 승인 프로젝트를 별도로 보유한 때만 작동하며 GitHub 클론에 필수인 경로가 아니다.

```sh
python3 .agents/skills/book-kinetic-ad/scripts/seed_project.py --target projects/003-new-book/videos/reference-study --reference
```

시작 스크립트의 CLI 핀은 0.8.32이다. 설치된 HyperFrames 스킬의 버전 점검/업그레이드 절차를 따른다. 규격을 바꾸면 animation뿐 아니라 render 명령의 fps, BRIEF와 미디어 길이를 함께 바꾼다.

## 수정과 반복 방지

여러 수정 요청은 시간·대상·속성·목표 상태를 간단히 정리하고 영향을 받는 등장·정지·전환을 확인한다. 단일 수정에는 별도 표를 강제하지 않는다. 이전 최종 영상과 재생성 가능한 소스를 보존한다.

새 독립 작업의 최종 검수에서는 최근 작업과 도입·배치·전환·엔딩·음악을 대조한다. 제목·색만 달라졌다면 카피와 장면 설계부터 수정한다. 좁은 수정이나 시리즈 통일 요청에는 변화의 개수를 강제하지 않는다.

## 이 프로젝트에서 확인한 중요한 함정

1. **Lottie null 부모의 opacity에 자식 페이드를 맡기지 않는다.** 부모의 이동·회전·스케일은 공유하되 사라짐은 실제 자식 shape/image의 `ks.o` 및 `op`에 준다. 기준본에서 표지 뒤로 도서명 일부가 튀어나온 문제가 이 원인이었다. 표지 전환은 꼭 중간 시점을 확인한다.
2. **폰트 변경은 이름 치환이 아니다.** 새 TTF/OTF에서 글리프를 다시 추출하고 폐곡선·구멍·폭을 확인한다. 기준 구현은 `opentype.js` 경로를 Lottie `sh`로 변환한다. 작은 카피는 Bold, 큰 카피는 Black으로 분리하고 자간도 별도로 계산한다.
3. **실제 alpha를 검사한다.** 체커보드가 인쇄된 RGB는 투명 PNG가 아니다. 모드·alpha 최솟값·투명 픽셀과 내부 흰색을 색 배경에서 확인한다. 일괄적인 흰색 제거는 흰 얼굴/모니터를 없앨 수 있다. 이전의 특정 체커보드용 픽셀 규칙을 새로운 이미지에 무조건 재사용하지 않는다.
4. **SVG 경로 텍스트는 자동 대비 검사에서 0개로 나올 수 있다.** 0/0은 가독성 검증이 아니다. 실제 색 대비와 렌더 프레임을 직접 확인한다. 검사를 통과시키려고 모든 오브젝트의 잘림 경고를 숨기지 않는다.
5. **최종 파일과 생성기의 음원 경로를 같이 바꾼다.** 승인된 합성 미리보기만 복사하고 생성기에 옛 BGM을 남기면 다음 렌더에서 되돌아간다. 소스·MP4·패키지·README의 최신 상태를 맞춘다.

## Lottie / HyperFrames 연결

- 하나의 1080×1920, 18초/60fps Lottie 시간축이 기준이며 프레임 단위를 명시한다. 길이 변경 시 `fr`, `op`, HTML `data-duration`, 미디어 종료를 함께 맞춘다.
- Lottie는 로컬 데이터/파일로 로드하고 `autoplay:false`, `loop:false`, 반환 인스턴스를 `window.__hfLottie`에 등록한다. 고정 크기의 컨테이너를 사용한다.
- HyperFrames 루트는 명시적 크기와 `data-composition-id`를 갖는다. GSAP 레지스트리는 한 개의 paused master만 유지한다. 렌더 핵심 동작을 벽시계나 이벤트 누적 상태로 제어하지 않는다.
- 오디오는 `id`, `src`, `data-start`, `data-duration`이 있는 별도 `<audio>` 요소로 둔다. 직접 `play()`/`currentTime`을 제어하지 않는다.
- 배포할 Lottie JSON은 이미지 경로가 해석될 기준을 명확히 하거나 이미지 데이터를 내장한다. 내장형 JSON에도 오디오는 별도 파일임을 명시한다. 음원 파일의 패키지 포함은 MUSIC.md에 기록한 전달 조건을 따른다.

## 적정 검증

스타일/구성 변경에는 모든 비트의 읽는 홀드와 대표 전환을 캡처한다. 좁은 수정에는 영향을 받은 장면과 폰트 재조판의 영향을 확인한다. 반동의 최대 크기, 화면 끝을 지나는 그림, 표지 인계 중간처럼 실제 문제가 생길 곳을 골라 검사한다.

```sh
npx hyperframes@0.8.32 snapshot --at 1.3,2.8,4.85,6.8,9.8,12.5,13.7,16.5
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of json deliverables/film.mp4
ffmpeg -v error -i deliverables/film.mp4 -f null -
```

검사 시점은 기준 18초 구성의 예시다. 새 타이밍에 맞춰 바꾼다. 자동 검사 외에 실제 출력 MP4를 샘플링해 그림과 글자가 구현대로 재생되는지 확인한다. 오디오를 요청한 영상은 오디오 스트림이 존재하고 길이가 맞는지 확인한다.
