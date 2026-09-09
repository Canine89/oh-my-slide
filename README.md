# oh-my-slide

도서 홍보용 키네틱 타이포 광고를 만드는 공통 스킬과 HyperFrames 시작 코드입니다.

## 포함된 것

- `.agents/skills/book-kinetic-ad/`: 카피·타이포·전환·상업용 BGM 선택·검증 지침
- `CLAUDE.md`, `AGENTS.md`: 에이전트별 작업 지침
- 새 프로젝트 생성기와 Lottie/HyperFrames 출력 연결 코드
- Paperlogy Bold/Black 및 OFL1.1 라이선스
- 고정된 npm 의존성과 런타임 준비 스크립트

도서 원본, 음원, 완성 영상, 개별 캠페인 폴더, 캐시는 포함하지 않습니다.

## 시작하기

Node.js22 이상, Python3, FFmpeg가 필요합니다.

```sh
# 필요한 HyperFrames 스킬 준비
npx hyperframes skills update general-video

# 새 클론에서는001부터, 기존 로컬 작업이 있으면 다음 순번 사용
python3 .agents/skills/book-kinetic-ad/scripts/seed_project.py --target projects/001-new-book/videos/main
cd projects/001-new-book/videos/main
npm ci
```

`npm ci`가 고정된 패키지에서 Lottie·GSAP와 라이선스 파일을 `assets/`에 준비합니다. 기존 캠페인 폴더가 없어도 실행됩니다.

사용자 원본은 작업의 `source-assets/`에 보존하고 사용할 파일을 영상 `assets/`에 둡니다. BRIEF를 정리한 다음 `scripts/composition.mjs`에서 Lottie `animation`과 로컬 음악 경로를 export합니다. 의도적인 무음이면 `audio = null`로 지정합니다. 미작성 구성이나 미선택 음악은 빌드 오류로 알려 줍니다.

```sh
npm run build
npm run check
npm run render
npm run dev
```

`--reference`는 기존 승인 프로젝트를 **별도로 보유한 로컬 환경**에서만 사용할 수 있는 선택 기능입니다. 새 작업의 기본 경로에는 필요하지 않습니다.

## 문서

- [도서 광고 스킬](.agents/skills/book-kinetic-ad/SKILL.md)
- [스타일·구성](.agents/skills/book-kinetic-ad/references/style-and-rhythm.md)
- [음악 선택](.agents/skills/book-kinetic-ad/references/music-selection.md)
- [구현·검증](.agents/skills/book-kinetic-ad/references/implementation.md)
- [폰트 라이선스](.agents/skills/book-kinetic-ad/assets/starter/assets/fonts/OFL.txt)

제3자 폰트와 라이브러리는 각자의 라이선스를 따릅니다. 선택한 BGM의 광고 사용·출처 표기·파일 재배포 조건은 곡별로 확인합니다.
