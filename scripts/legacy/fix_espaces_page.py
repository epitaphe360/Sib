"""Fix EspacesSibPage.tsx subtitle fallback."""

def fix_espaces():
    path = 'src/pages/public/EspacesSibPage.tsx'
    with open(path, 'rb') as f:
        content = f.read()

    idx = content.find(b'subtitle={cms.hero_subtitle')
    assert idx != -1, 'subtitle not found'
    # Try both CRLF and LF endings
    end = content.find(b'}\r\n', idx)
    crlf = True
    if end == -1:
        end = content.find(b'}\n', idx)
        crlf = False
    assert end != -1, 'end not found'
    old_sub = content[idx:end+1]
    print('OLD subtitle (first 80):', repr(old_sub[:80]))
    print('CRLF:', crlf)
    new_sub = b"subtitle={cms.hero_subtitle || t('espaces.hero_subtitle')}"
    new_content = content[:idx] + new_sub + content[end+1:]
    with open(path, 'wb') as f:
        f.write(new_content)
    print('Done EspacesSibPage.tsx')

fix_espaces()
