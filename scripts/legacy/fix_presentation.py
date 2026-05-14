"""Fix PresentationPage.tsx - translate hardcoded badge."""

def fix_presentation():
    path = 'src/pages/public/PresentationPage.tsx'
    with open(path, 'rb') as f:
        content = f.read()

    # Find the badge text - it contains "20ème Édition" - search for ASCII part
    idx = content.find(b"20\xc3\xa8me \xc3\x89dition")
    if idx == -1:
        idx = content.find(b"20")  # fallback
        print('searching for 20...')
    
    # Find the span start
    span_start = content.rfind(b'<span', 0, idx)
    span_end = content.find(b'</span>', idx) + len(b'</span>')
    old_badge = content[span_start:span_end]
    print('OLD badge span:', repr(old_badge))
    new_badge = b'{t(\'presentation.badge\')}'
    # But wait - we need to keep the span wrapper if it has className
    # Actually the badge is inside a <span> - let's replace just the text inside it
    # Find text content start (after >)
    text_start = content.find(b'>', span_start) + 1
    text_end = content.find(b'</span>', text_start)
    old_text = content[text_start:text_end]
    print('OLD text:', repr(old_text))
    new_text = b"{t('presentation.badge')}"
    new_content = content[:text_start] + new_text + content[text_end:]
    with open(path, 'wb') as f:
        f.write(new_content)
    print('Done PresentationPage.tsx')

fix_presentation()
