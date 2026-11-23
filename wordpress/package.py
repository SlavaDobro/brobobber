#!/usr/bin/env python3
"""Packs the theme, the plugin and the media pack into wordpress/dist with forward-slash paths."""
import os, zipfile

here = os.path.dirname(os.path.abspath(__file__))
dist = os.path.join(here, 'dist')

def pack(name, source, top, compression):
    path = os.path.join(dist, name)
    with zipfile.ZipFile(path, 'w', compression, compresslevel=6 if compression == zipfile.ZIP_DEFLATED else None) as z:
        for folder, dirs, files in os.walk(source):
            dirs[:] = sorted(d for d in dirs if not d.startswith('.'))
            for file in sorted(files):
                if file.startswith('.'):
                    continue
                full = os.path.join(folder, file)
                z.write(full, top + '/' + os.path.relpath(full, source).replace(os.sep, '/'))
    print(f'{name}: {os.path.getsize(path) / 1048576:.1f} MB')

pack('brobobber-theme.zip', os.path.join(here, 'brobobber'), 'brobobber', zipfile.ZIP_DEFLATED)
pack('brobobber-core.zip', os.path.join(here, 'brobobber-core'), 'brobobber-core', zipfile.ZIP_DEFLATED)
pack('brobobber-media.zip', os.path.join(dist, 'media'), 'brobobber-import', zipfile.ZIP_STORED)
