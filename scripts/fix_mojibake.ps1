$root = "c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\sib-app\src"
$extensions = @('.ts', '.tsx', '.json', '.css', '.md')
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object { $extensions -contains $_.Extension }
$fixed = @()

foreach ($f in $files) {
  $txt = Get-Content -Raw -Path $f.FullName
  $hasMojibake = $txt.Contains([char]0x00C3) -or $txt.Contains([char]0x00C2) -or $txt.Contains([char]0x00C5)
  if ($hasMojibake) {
    $bytes = [System.Text.Encoding]::GetEncoding(28591).GetBytes($txt)
    $conv = [System.Text.Encoding]::UTF8.GetString($bytes)

    $oldScore = 0
    $newScore = 0
    foreach ($c in @([char]0x00C3, [char]0x00C2, [char]0x00C5)) {
      $oldScore += ($txt.ToCharArray() | Where-Object { $_ -eq $c }).Count
      $newScore += ($conv.ToCharArray() | Where-Object { $_ -eq $c }).Count
    }

    if ($newScore -lt $oldScore) {
      Set-Content -Path $f.FullName -Value $conv -Encoding UTF8
      $fixed += $f.FullName
    }
  }
}

"FILES_REENCODED=$($fixed.Count)"
$fixed | Select-Object -First 200
