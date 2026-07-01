$ErrorActionPreference = 'Stop'
$resultFile = 'C:\Users\AINov\.claude\projects\C--Users-AINov-Documents-global-pest-supplies\f4f8c1f1-e52c-429b-8d27-d4c8ccc4814a\tool-results\mcp-9a190414-3072-4650-981d-7acf47a8b4eb'  # placeholder
$resultFile = $args[0]
$imgDir = 'C:\Users\AINov\Documents\global-pest-supplies\assets\products'

# input order = handle order (must match the stagedUploadsCreate input order exactly)
$handles = @(
 'gps-broad-spectrum-concentrate-79','gps-pro-concentrate-251','gps-roach-gel-bait','gps-ant-gel-bait',
 'gps-rodent-bait-station','gps-rodent-bait-blocks','gps-snap-trap-6pk','gps-glue-boards-12pk',
 'gps-mosquito-yard-concentrate','gps-bed-bug-kit','gps-bed-bug-spray','gps-insecticide-dust',
 'gps-termite-foam','gps-termite-bait-system','gps-wasp-hornet-spray','gps-flea-tick-igr-concentrate',
 'gps-pump-sprayer-1gal','gps-hand-duster','gps-ant-kit','gps-roach-kit','gps-rodent-kit',
 'gps-mosquito-kit','gps-mosquito-larvicide-dunks','gps-spider-spray','gps-fly-light-trap',
 'gps-granular-insect-bait','gps-natural-diatomaceous-earth','gps-pro-starter-bundle'
)

$json = Get-Content $resultFile -Raw | ConvertFrom-Json
$targets = $json.data.stagedUploadsCreate.stagedTargets
if ($targets.Count -ne $handles.Count) { throw "target count $($targets.Count) != handle count $($handles.Count)" }

$map = [ordered]@{}
for ($i = 0; $i -lt $targets.Count; $i++) {
  $t = $targets[$i]
  $handle = $handles[$i]
  $png = Join-Path $imgDir ($handle + '.png')
  if (-not (Test-Path $png)) { throw "missing png $png" }

  $curlArgs = @('-s','-o','NUL','-w','%{http_code}','-X','POST')
  foreach ($p in $t.parameters) { $curlArgs += @('-F', ("{0}={1}" -f $p.name, $p.value)) }
  $curlArgs += @('-F', ("file=@{0};type=image/png" -f $png))
  $curlArgs += $t.url
  $code = & curl.exe @curlArgs
  $map[$handle] = $t.resourceUrl
  "{0,-36} HTTP {1}" -f $handle, $code | Write-Output
}

$outFile = 'C:\Users\AINov\Documents\global-pest-supplies\tools\staged-urls.json'
$map | ConvertTo-Json | Set-Content $outFile -Encoding UTF8
"`nSaved $($map.Count) resource URLs to $outFile"