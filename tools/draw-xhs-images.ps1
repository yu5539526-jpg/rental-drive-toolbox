param(
  [Parameter(Mandatory = $true)][string]$DataPath,
  [Parameter(Mandatory = $true)][string]$OutDir
)

Add-Type -AssemblyName System.Drawing

$script:W = 1242
$script:H = 1660
$script:FontName = "Microsoft YaHei"

function Color-Hex([string]$Hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($Hex)
}

function New-Brush([string]$Hex) {
  return New-Object System.Drawing.SolidBrush (Color-Hex $Hex)
}

function New-PenHex([string]$Hex, [float]$Width = 1) {
  return New-Object System.Drawing.Pen (Color-Hex $Hex), $Width
}

function New-FontPx([float]$Size, [string]$Style = "Regular") {
  $styleValue = [Enum]::Parse([System.Drawing.FontStyle], $Style)
  return New-Object System.Drawing.Font -ArgumentList @($script:FontName, [single]$Size, $styleValue, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-Page {
  $bmp = New-Object System.Drawing.Bitmap $script:W, $script:H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear((Color-Hex "#F6FAF7"))
  $brush = New-Brush "#1E6F67"
  $g.FillRectangle($brush, 0, 0, $script:W, 18)
  $brush.Dispose()
  return @{ Bmp = $bmp; G = $g }
}

function Draw-Text($g, [string]$Text, $Font, [string]$Color, [float]$X, [float]$Y, [float]$Width, [float]$Height, [string]$Align = "Near", [string]$LineAlign = "Near") {
  $brush = New-Brush $Color
  $rect = New-Object System.Drawing.RectangleF ([single]$X), ([single]$Y), ([single]$Width), ([single]$Height)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [Enum]::Parse([System.Drawing.StringAlignment], $Align)
  $format.LineAlignment = [Enum]::Parse([System.Drawing.StringAlignment], $LineAlign)
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::LineLimit
  $g.DrawString($Text, $Font, $brush, $rect, $format)
  $format.Dispose()
  $brush.Dispose()
}

function Fill-Rect($g, [string]$Color, [float]$X, [float]$Y, [float]$Width, [float]$Height) {
  $brush = New-Brush $Color
  $g.FillRectangle($brush, [single]$X, [single]$Y, [single]$Width, [single]$Height)
  $brush.Dispose()
}

function Stroke-Rect($g, [string]$Color, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$LineWidth = 2) {
  $pen = New-PenHex $Color $LineWidth
  $g.DrawRectangle($pen, [single]$X, [single]$Y, [single]$Width, [single]$Height)
  $pen.Dispose()
}

function Draw-Pill($g, [string]$Text, [float]$X, [float]$Y, [float]$Width, [float]$Height, [string]$Fill = "#FFF2DA", [string]$Border = "#EFC894", [string]$Color = "#9A551D", [float]$Size = 25) {
  Fill-Rect $g $Fill $X $Y $Width $Height
  Stroke-Rect $g $Border $X $Y $Width $Height 2
  $font = New-FontPx $Size "Bold"
  Draw-Text $g $Text $font $Color ($X + 8) $Y ($Width - 16) $Height "Center" "Center"
  $font.Dispose()
}

function Draw-Brand($g, [string]$PageNo) {
  $fontSmall = New-FontPx 25 "Bold"
  Draw-Text $g $PageNo $fontSmall "#CF7831" 64 45 180 36
  Draw-Text $g $script:Brand $fontSmall "#1E6F67" 930 45 248 36 "Far"
  $fontSmall.Dispose()
}

function Draw-Footer($g, [string]$Left, [string]$Right) {
  $font = New-FontPx 24 "Regular"
  $bold = New-FontPx 24 "Bold"
  Draw-Text $g $Left $font "#5B6C70" 64 1570 820 42
  Draw-Text $g $Right $bold "#183E4D" 890 1570 288 42 "Far"
  $font.Dispose()
  $bold.Dispose()
}

function Save-Page($page, [string]$FileName) {
  $path = Join-Path $OutDir $FileName
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }
  $page.Bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $page.G.Dispose()
  $page.Bmp.Dispose()
}

function Draw-Header($g, [string]$Kicker, [string]$Title, [string]$Subtitle) {
  Draw-Pill $g $Kicker 64 100 275 42 "#FFF2DA" "#EFC894" "#9A551D" 25
  $h1 = New-FontPx 58 "Bold"
  $sub = New-FontPx 28 "Regular"
  Draw-Text $g $Title $h1 "#183E4D" 64 158 990 132
  Draw-Text $g $Subtitle $sub "#51666B" 64 300 960 84
  $h1.Dispose()
  $sub.Dispose()
}

function Draw-TableCell($g, [string]$Text, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Size = 24, [string]$Color = "#263B40", [string]$Style = "Regular", [string]$Align = "Near") {
  $font = New-FontPx $Size $Style
  Draw-Text $g $Text $font $Color ($X + 12) ($Y + 12) ($Width - 24) ($Height - 18) $Align
  $font.Dispose()
}

function Draw-DestinationPage($group, [int]$Index) {
  $page = New-Page
  $g = $page.G
  Draw-Brand $g ("0{0}/07" -f ($Index + 2))
  Draw-Header $g $script:DestinationKicker $group.title $group.subtitle

  $x = 52
  $y = 420
  $w = 1138
  $tableH = 1088
  $headerH = 70
  $rows = @($group.destinations)
  $rowH = [Math]::Floor(($tableH - $headerH) / $rows.Count)
  $colWidths = @(205, 285, 250, 115, 283)
  $headers = @($script:DestinationHeaders)

  Fill-Rect $g "#FFFFFF" $x $y $w $tableH
  Stroke-Rect $g "#D7E6E2" $x $y $w $tableH 2

  $cx = $x
  for ($i = 0; $i -lt $headers.Count; $i++) {
    Fill-Rect $g "#1E6F67" $cx $y $colWidths[$i] $headerH
    Draw-TableCell $g $headers[$i] $cx $y $colWidths[$i] $headerH 24 "#FFFFFF" "Bold"
    $cx += $colWidths[$i]
  }

  for ($r = 0; $r -lt $rows.Count; $r++) {
    $item = $rows[$r]
    $ry = $y + $headerH + ($r * $rowH)
    $fill = if ($r % 2 -eq 0) { "#FFFFFF" } else { "#FBFDFB" }
    Fill-Rect $g $fill $x $ry $w $rowH
    Stroke-Rect $g "#E2ECE9" $x $ry $w $rowH 1
    $cx = $x
    Draw-TableCell $g $item.name $cx $ry $colWidths[0] $rowH 25 "#183E4D" "Bold"
    Draw-Pill $g $group.tag ($cx + 12) ($ry + $rowH - 38) 118 28 "#EAF5F2" "#C8DDD8" "#1E6F67" 18
    $cx += $colWidths[0]
    Draw-TableCell $g ($item.scene + "`n" + $item.roadShort) $cx $ry $colWidths[1] $rowH 23 "#263B40" "Regular"
    $cx += $colWidths[1]
    Draw-TableCell $g ($item.car + "`n" + $item.peopleShort) $cx $ry $colWidths[2] $rowH 23 "#263B40" "Bold"
    $cx += $colWidths[2]
    $evColor = if ($item.ev -eq $script:EvOk) { "#1E6F67" } else { "#B05F1D" }
    Draw-TableCell $g $item.ev $cx $ry $colWidths[3] $rowH 24 $evColor "Bold" "Center"
    $cx += $colWidths[3]
    Draw-TableCell $g ($item.tip + "`n" + $item.anchorShort) $cx $ry $colWidths[4] $rowH 22 "#263B40" "Regular"
  }

  Draw-Footer $g $script:DestinationFooterLeft $script:DestinationFooterRight
  Save-Page $page $group.file
}

function Draw-Cover($data) {
  $page = New-Page
  $g = $page.G
  Draw-Brand $g "01/07"
  Draw-Pill $g $data.cover.kicker 78 150 292 48 "#FFF2DA" "#EFC894" "#9A551D" 26
  $h1 = New-FontPx 78 "Bold"
  $sub = New-FontPx 34 "Regular"
  Draw-Text $g $data.cover.title $h1 "#183E4D" 78 222 1050 245
  Draw-Text $g $data.cover.subtitle $sub "#3F565C" 78 500 940 98
  $h1.Dispose()
  $sub.Dispose()

  $chipX = 78
  $chipY = 640
  foreach ($chip in $data.cover.chips) {
    $width = [Math]::Max(150, 34 + ([string]$chip).Length * 28)
    Draw-Pill $g $chip $chipX $chipY $width 56 "#FFFFFF" "#D7E6E2" "#1E6F67" 27
    $chipX += $width + 18
    if ($chipX -gt 930) {
      $chipX = 78
      $chipY += 74
    }
  }

  $miniY = 1040
  $miniW = 347
  $miniH = 330
  $gap = 22
  for ($i = 0; $i -lt $data.cover.mini.Count; $i++) {
    $mini = $data.cover.mini[$i]
    $mx = 78 + ($i * ($miniW + $gap))
    Fill-Rect $g "#FFFFFF" $mx $miniY $miniW $miniH
    Stroke-Rect $g "#D7E6E2" $mx $miniY $miniW $miniH 2
    Fill-Rect $g "#1E6F67" $mx $miniY $miniW 72
    $titleFont = New-FontPx 28 "Bold"
    Draw-Text $g $mini.title $titleFont "#FFFFFF" ($mx + 18) ($miniY + 17) ($miniW - 36) 38
    $titleFont.Dispose()
    $lineFont = New-FontPx 25 "Regular"
    for ($j = 0; $j -lt $mini.lines.Count; $j++) {
      Draw-Text $g $mini.lines[$j] $lineFont "#30474D" ($mx + 18) ($miniY + 96 + ($j * 64)) ($miniW - 36) 52
    }
    $lineFont.Dispose()
  }

  Draw-Footer $g $data.cover.footerLeft $data.cover.footerRight
  Save-Page $page $data.cover.file
}

function Draw-Budget($data) {
  $page = New-Page
  $g = $page.G
  Draw-Brand $g "06/07"
  Draw-Header $g $data.budget.kicker $data.budget.title $data.budget.subtitle

  $x = 52
  $y = 430
  $w = 1138
  $headerH = 72
  $rowH = 92
  $colWidths = @(270, 480, 388)
  Fill-Rect $g "#FFFFFF" $x $y $w ($headerH + ($rowH * $data.budget.rows.Count))
  Stroke-Rect $g "#D7E6E2" $x $y $w ($headerH + ($rowH * $data.budget.rows.Count)) 2
  $headers = @($data.budget.headers)
  $cx = $x
  for ($i = 0; $i -lt 3; $i++) {
    Fill-Rect $g "#1E6F67" $cx $y $colWidths[$i] $headerH
    Draw-TableCell $g $headers[$i] $cx $y $colWidths[$i] $headerH 27 "#FFFFFF" "Bold"
    $cx += $colWidths[$i]
  }
  for ($r = 0; $r -lt $data.budget.rows.Count; $r++) {
    $row = $data.budget.rows[$r]
    $ry = $y + $headerH + ($r * $rowH)
    Fill-Rect $g (if ($r % 2 -eq 0) { "#FFFFFF" } else { "#FBFDFB" }) $x $ry $w $rowH
    Stroke-Rect $g "#E2ECE9" $x $ry $w $rowH 1
    Draw-TableCell $g $row.item $x $ry $colWidths[0] $rowH 28 "#183E4D" "Bold"
    Draw-TableCell $g $row.method ($x + $colWidths[0]) $ry $colWidths[1] $rowH 27 "#263B40"
    Draw-TableCell $g $row.tip ($x + $colWidths[0] + $colWidths[1]) $ry $colWidths[2] $rowH 27 "#263B40"
  }

  $boxY = 1190
  $boxW = 558
  for ($i = 0; $i -lt $data.budget.formulas.Count; $i++) {
    $box = $data.budget.formulas[$i]
    $bx = 52 + ($i * 580)
    Fill-Rect $g "#FFF2DA" $bx $boxY $boxW 150
    Stroke-Rect $g "#EFC894" $bx $boxY $boxW 150 2
    $fTitle = New-FontPx 31 "Bold"
    $fBody = New-FontPx 23 "Regular"
    Draw-Text $g $box.title $fTitle "#8A4B14" ($bx + 24) ($boxY + 18) ($boxW - 48) 38
    Draw-Text $g $box.body $fBody "#33494F" ($bx + 24) ($boxY + 60) ($boxW - 48) 84
    $fTitle.Dispose()
    $fBody.Dispose()
  }
  Fill-Rect $g "#EAF5F2" 52 1365 1138 90
  Stroke-Rect $g "#C8DDD8" 52 1365 1138 90 2
  $noteFont = New-FontPx 27 "Regular"
  Draw-Text $g $data.budget.note $noteFont "#24464A" 76 1385 1090 52
  $noteFont.Dispose()

  Draw-Footer $g $data.budget.footerLeft $data.budget.footerRight
  Save-Page $page $data.budget.file
}

function Draw-Checklist($data) {
  $page = New-Page
  $g = $page.G
  Draw-Brand $g "07/07"
  Draw-Header $g $data.checklist.kicker $data.checklist.title $data.checklist.subtitle

  $startX = 52
  $startY = 420
  $cardW = 560
  $cardH = 146
  $gapX = 18
  $gapY = 18
  for ($i = 0; $i -lt $data.checklist.blocks.Count; $i++) {
    $block = $data.checklist.blocks[$i]
    $col = $i % 2
    $row = [Math]::Floor($i / 2)
    $x = $startX + ($col * ($cardW + $gapX))
    $y = $startY + ($row * ($cardH + $gapY))
    Fill-Rect $g "#FFFFFF" $x $y $cardW $cardH
    Stroke-Rect $g "#D7E6E2" $x $y $cardW $cardH 2
    Fill-Rect $g "#1E6F67" ($x + 18) ($y + 20) 58 58
    $idxFont = New-FontPx 24 "Bold"
    Draw-Text $g ("{0:00}" -f ($i + 1)) $idxFont "#FFFFFF" ($x + 18) ($y + 20) 58 58 "Center" "Center"
    $idxFont.Dispose()
    $titleFont = New-FontPx 31 "Bold"
    $bodyFont = New-FontPx 27 "Regular"
    Draw-Text $g $block.title $titleFont "#183E4D" ($x + 94) ($y + 18) ($cardW - 120) 42
    Draw-Text $g $block.body $bodyFont "#33494F" ($x + 94) ($y + 65) ($cardW - 120) 64
    $titleFont.Dispose()
    $bodyFont.Dispose()
  }
  Fill-Rect $g "#FFF2DA" 52 1115 1138 190
  Stroke-Rect $g "#EFC894" 52 1115 1138 190 2
  $eFont = New-FontPx 29 "Regular"
  Draw-Text $g $data.checklist.evidence $eFont "#33494F" 76 1142 1090 130
  $eFont.Dispose()
  Fill-Rect $g "#EAF5F2" 52 1338 1138 86
  Stroke-Rect $g "#C8DDD8" 52 1338 1138 86 2
  $nFont = New-FontPx 28 "Bold"
  Draw-Text $g $data.checklist.notice $nFont "#1E6F67" 76 1360 1090 42 "Center"
  $nFont.Dispose()
  Draw-Footer $g $data.checklist.footerLeft $data.checklist.footerRight
  Save-Page $page $data.checklist.file
}

$json = Get-Content -LiteralPath $DataPath -Raw -Encoding UTF8
$data = $json | ConvertFrom-Json
$script:Brand = $data.static.brand
$script:DestinationKicker = $data.static.destinationKicker
$script:DestinationHeaders = @($data.static.destinationHeaders)
$script:DestinationFooterLeft = $data.static.destinationFooterLeft
$script:DestinationFooterRight = $data.static.destinationFooterRight
$script:EvOk = $data.static.evOk

Draw-Cover $data
for ($i = 0; $i -lt $data.groups.Count; $i++) {
  Draw-DestinationPage $data.groups[$i] $i
}
Draw-Budget $data
Draw-Checklist $data
