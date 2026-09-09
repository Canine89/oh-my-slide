#!/usr/bin/env python3
"""Seed shared book-ad tooling; copy the old campaign only with --reference."""
import argparse
import json
import re
import shutil
import tempfile
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
PROJECT = Path('projects/001-barobaro-python/videos/barobaro-python')
COMMON_FILES = [
    'package.json', 'package-lock.json', 'hyperframes.json', 'scripts/prepare-runtime.mjs',
    'assets/fonts/Paperlogy-9Black.ttf', 'assets/fonts/Paperlogy-7Bold.ttf',
    'assets/fonts/OFL.txt', 'assets/fonts/NOTICE.md',
]
REFERENCE_FILES = [
    'package.json', 'package-lock.json', 'hyperframes.json',
    'assets/fonts/Paperlogy-9Black.ttf', 'assets/fonts/Paperlogy-7Bold.ttf',
    'assets/fonts/Paperlogy-LICENSE.md', 'assets/lottie.min.js', 'assets/gsap.min.js',
    'assets/cover.png', 'assets/cutouts/metadata.json',
    *[f'assets/cutouts/illustration-{i}.png' for i in range(1, 6)],
    'assets/icons/kakaotalk.png', 'assets/icons/kakaotalk.svg',
    'assets/music/funkee-monkeee-18s.wav', 'deliverables/final/MUSIC.md',
]


def locate_root(explicit):
    if explicit:
        root = Path(explicit).expanduser().resolve()
        if not (root / PROJECT).is_dir():
            raise ValueError(f'Approved reference project not found under {root}')
        return root
    for root in SKILL.parents:
        if (root / PROJECT / 'scripts/build-v4.mjs').is_file():
            return root
    raise ValueError('Run inside the original repository or pass --repo-root.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', required=True, help='New project directory; must not exist')
    parser.add_argument('--repo-root', help='Repository containing the approved reference project')
    parser.add_argument('--reference', action='store_true', help='Explicitly clone the approved reference campaign including its music')
    args = parser.parse_args()
    try:
        root = locate_root(args.repo_root) if args.reference else SKILL.parents[2]
        source = root / PROJECT if args.reference else SKILL / 'assets/starter'
        target = Path(args.target).expanduser().resolve()
        if target.exists() or target.is_symlink():
            raise ValueError(f'Refusing to overwrite existing target: {target}')
        if source == target or source in target.parents:
            raise ValueError('Choose a sibling project, not a directory inside the approved reference.')
        files = REFERENCE_FILES if args.reference else COMMON_FILES
        missing = [name for name in files if not (source / name).is_file()]
        if missing:
            raise ValueError('Missing source files: ' + ', '.join(missing))
        builder = SKILL / 'assets' / ('build-reference.mjs' if args.reference else 'build-starter.mjs')
        if not builder.is_file():
            raise ValueError(f'Missing builder: {builder}')
        target.parent.mkdir(parents=True, exist_ok=True)
        stage = Path(tempfile.mkdtemp(prefix='.kinetic-seed-', dir=target.parent))
        try:
            for name in files:
                dest = stage / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source / name, dest)
            for folder in ['scripts', 'assets/lottie', 'assets/music', 'deliverables/final']:
                (stage / folder).mkdir(parents=True, exist_ok=True)
            code = builder.read_text(encoding='utf-8').replace('python-kinetic-v4.json', 'kinetic-ad.json')
            (stage / 'scripts/build-ad.mjs').write_text(code, encoding='utf-8')
            if not args.reference:
                (stage / 'scripts/composition.mjs').write_text('''// Author the new book's Lottie data here after deciding its copy, layout and music.
// Fonts and runtimes are local. Original assets and the new BGM must be supplied.
// Export an animation starting at ip:0 and matching w/h/fr/op to the brief.
export const animation = null;
// Example: {src:'assets/music/selected-edit.wav', volume:1}; null means deliberate silence.
export const audio = undefined;
''', encoding='utf-8')
            pkg = json.loads((stage / 'package.json').read_text())
            slug = re.sub(r'[^a-z0-9-]+', '-', target.name.lower()).strip('-') or 'book-ad'
            pkg['name'] = slug
            pkg['scripts'] = {
                **({} if args.reference else {'postinstall': 'node scripts/prepare-runtime.mjs'}),
                'build': 'node scripts/build-ad.mjs',
                'check': 'npx --yes hyperframes@0.8.32 check',
                'dev': 'npx --yes hyperframes@0.8.32 preview',
                'render': 'npx --yes hyperframes@0.8.32 render -o deliverables/film.mp4 --fps 60 --quality high',
            }
            (stage / 'package.json').write_text(json.dumps(pkg, indent=2) + '\n')
            lock = json.loads((stage / 'package-lock.json').read_text())
            lock['name'] = slug
            lock['packages']['']['name'] = slug
            (stage / 'package-lock.json').write_text(json.dumps(lock, indent=2) + '\n')
            (stage / 'meta.json').write_text(json.dumps({'id': slug, 'name': slug}, indent=2) + '\n')
            (stage / '.gitignore').write_text('node_modules/\n.hyperframes/\n.thumbnails/\n.DS_Store\n')
            if args.reference:
                body = '''# Reference reproduction — not a new campaign

This mode explicitly copies the BARO/Paperlogy reference, including its book assets and music.
Use it to reproduce/reference that campaign. For an independent new book use the default clean scaffold.
Do not present this reproduction as a newly designed ad.
'''
            else:
                body = '''# New book — author the brief and composition

Common fonts and runtimes only; no previous book assets, scenes, platform benefits or music.
Complete this brief from the user's request and available sources; do not repeat answered questions.

## Message and evidence
Identify the reader, problem, book's benefit and supporting source. Choose one central promise.

## 연출 선택
Compare plausible approaches, choose the best for this book, and note the meaningful differences from recent work.
Record the opening, spatial composition, primary transition and product reveal; do not inherit a fixed six-scene arc.

## Music
Unless silence or a specific track is requested, find and audition commercially usable music for this book.
Check the official track/license, select the usable segment, save it locally and record MUSIC.md.
Then author scripts/composition.mjs and run build/check/render. An unfilled composition deliberately fails build.
'''
            (stage / 'BRIEF.md').write_text('''---
workflow: general-video
flow: automation
storyboard: no
aspect: "9:16"
length: 18
language: ko
---

''' + body, encoding='utf-8')
            (stage / 'AGENTS.md').write_text('''# Book kinetic ad

Use the repository's `.agents/skills/book-kinetic-ad/SKILL.md` and HyperFrames runtime conventions.
Read BRIEF.md before authoring. A new book requires its own copy, scene design and music choice.
The normal starter owns output wiring in scripts/build-ad.mjs and creative content in scripts/composition.mjs.
An explicit --reference seed instead has the original campaign timeline in scripts/build-ad.mjs.
Run build and check, inspect real frames, and verify the final MP4. Keep approved source projects unchanged.
''', encoding='utf-8')
            kind = 'reference-seed' if args.reference else 'book-ad-scaffold'
            manifest = {
                'kind': kind, 'reference_project': str(PROJECT) if args.reference else None,
                'builder': f'.agents/skills/book-kinetic-ad/assets/{builder.name}',
                'copied_files': files,
                'authoring_required': ['book facts', 'copy', 'scene design', 'book assets', 'commercial BGM selection'],
            }
            manifest_name = 'REFERENCE-SEED.json' if args.reference else 'PROJECT-SEED.json'
            (stage / manifest_name).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
            if target.exists():
                raise ValueError(f'Target was created while staging; not replacing it: {target}')
            stage.rename(target)
        except Exception:
            shutil.rmtree(stage, ignore_errors=True)
            raise
        next_steps = ['npm ci', 'npm run build', 'npm run check'] if args.reference else [
            'author BRIEF.md and select licensed BGM', 'author scripts/composition.mjs',
            'npm ci', 'npm run build', 'npm run check',
        ]
        print(json.dumps({'ok': True, 'target': str(target), 'kind': kind, 'next': next_steps}, ensure_ascii=False))
    except (ValueError, OSError, json.JSONDecodeError) as error:
        parser.exit(1, f'{error}\n')


if __name__ == '__main__':
    main()
