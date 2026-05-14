"""Fix InfosPratiquesPage.tsx encoding-safe replacements."""

def fix_infos():
    path = 'src/pages/public/InfosPratiquesPage.tsx'
    with open(path, 'rb') as f:
        content = f.read()

    # 1. Replace title (no encoding issues)
    old_title = b'title={<>Infos <span className="text-yellow-300">Pratiques</span></>}'
    new_title = b"title={<>{t('infos.title_1')} <span className=\"text-yellow-300\">{t('infos.title_2')}</span></>}"
    assert old_title in content, 'title not found'
    content = content.replace(old_title, new_title, 1)
    print('Title replaced')

    # 2. Replace subtitle fallback - find exact end by finding the closing }
    # The subtitle line pattern: subtitle={cms.hero_subtitle || "Tout ce..."}\r\n
    sub_start = content.find(b'subtitle={cms.hero_subtitle ||')
    assert sub_start != -1, 'subtitle not found'
    # Find the closing brace of the JSX attribute (this line ends with }\r\n)
    sub_end = content.find(b'}\r\n', sub_start)
    assert sub_end != -1, 'subtitle end not found'
    sub_end += 1  # include the }
    old_sub = content[sub_start:sub_end]
    print('OLD subtitle:', repr(old_sub[:80]))
    new_sub = b"subtitle={cms.hero_subtitle || t('infos.hero_subtitle')}"
    content = content[:sub_start] + new_sub + content[sub_end:]
    print('Subtitle replaced')

    # 3. Replace the hébergement paragraph
    # Find the paragraph start
    para_marker = b'Les exposants et visiteurs disposent'
    para_p_start = content.rfind(b'<p className="text-gray-600 mb-4">', 0, content.find(para_marker))
    assert para_p_start != -1, 'para start not found'
    para_p_end = content.find(b'</p>', para_p_start) + len(b'</p>')
    old_para = content[para_p_start:para_p_end]
    print('OLD para (first 80):', repr(old_para[:80]))
    new_para = b'<p className="text-gray-600 mb-4">\r\n              {t(\'infos.hebergement_text\')}\r\n            </p>'
    content = content[:para_p_start] + new_para + content[para_p_end:]
    print('Hebergement replaced')

    with open(path, 'wb') as f:
        f.write(content)
    print('Done InfosPratiquesPage.tsx')

fix_infos()
