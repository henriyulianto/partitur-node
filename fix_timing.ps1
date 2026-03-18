$content = Get-Content 'TMK_08.yaml'
$lines = $content -split "`n"
for ($i = 27; $i -lt 122; $i++) {
    if ($lines[$i] -match '^\- \[(\d+), (\d+|\~), (\d+),') {
        $start = [int]$matches[1] - 192
        $channel = $matches[2]
        $end = [int]$matches[3] - 192
        $rest = $lines[$i] -replace '^\- \[\d+, \d+|\~, \d+,', ''
        $lines[$i] = "- [$start, $channel, $end,$rest"
    }
}
$lines -join "`n" | Set-Content 'TMK_08.yaml'
