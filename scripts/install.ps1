param(
  [string]$Version = $env:OPERO_VERSION,
  [string]$Repo = $(if ($env:OPERO_RELEASE_REPO) { $env:OPERO_RELEASE_REPO } else { "koda-software/opero-sdk" }),
  [string]$InstallDir = $(if ($env:OPERO_INSTALL_DIR) { $env:OPERO_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "opero-cli" }),
  [string]$BinDir = $(if ($env:OPERO_BIN_DIR) { $env:OPERO_BIN_DIR } else { Join-Path $env:LOCALAPPDATA "opero-cli\bin" })
)

$ErrorActionPreference = "Stop"

if (-not $Version) {
  $Version = "latest"
}

if ($env:PROCESSOR_ARCHITECTURE -notin @("AMD64", "x86_64")) {
  throw "Unsupported Windows architecture: $env:PROCESSOR_ARCHITECTURE"
}

$Target = "win32-x64"
$ApiBase = "https://api.github.com/repos/$Repo/releases"
if ($Version -eq "latest") {
  $Release = Invoke-RestMethod -Uri "$ApiBase/latest"
} else {
  $Release = Invoke-RestMethod -Uri "$ApiBase/tags/$Version"
}

$Tag = $Release.tag_name
if (-not $Tag) {
  throw "Could not determine release tag for $Repo $Version"
}

$Asset = $Release.assets | Where-Object { $_.name -match "opero-v.*-$Target\.tar\.gz$" } | Select-Object -First 1
$Checksums = $Release.assets | Where-Object { $_.name -eq "checksums.txt" } | Select-Object -First 1

if (-not $Asset) {
  throw "Could not find $Target tarball in release $Tag"
}

if (-not $Checksums) {
  throw "Could not find checksums.txt in release $Tag"
}

$Tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("opero-install-" + [System.Guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $Tmp | Out-Null

try {
  $ArchivePath = Join-Path $Tmp $Asset.name
  $ChecksumsPath = Join-Path $Tmp "checksums.txt"

  Write-Host "Downloading $($Asset.name)"
  Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $ArchivePath
  Invoke-WebRequest -Uri $Checksums.browser_download_url -OutFile $ChecksumsPath

  $ExpectedLine = Get-Content $ChecksumsPath | Where-Object { $_ -match "\s+$([regex]::Escape($Asset.name))$" } | Select-Object -First 1
  if (-not $ExpectedLine) {
    throw "checksums.txt does not contain $($Asset.name)"
  }

  $Expected = ($ExpectedLine -split "\s+")[0]
  $Actual = (Get-FileHash -Algorithm SHA256 $ArchivePath).Hash.ToLowerInvariant()
  if ($Actual -ne $Expected.ToLowerInvariant()) {
    throw "Checksum verification failed for $($Asset.name)"
  }

  $VersionDir = Join-Path $InstallDir $Tag
  if (Test-Path $VersionDir) {
    Remove-Item -Recurse -Force $VersionDir
  }

  New-Item -ItemType Directory -Force -Path $VersionDir | Out-Null
  New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
  tar -xzf $ArchivePath -C $VersionDir

  $SourceCmd = Join-Path $VersionDir "opero\bin\opero.cmd"
  if (-not (Test-Path $SourceCmd)) {
    throw "Installed artifact does not contain $SourceCmd"
  }

  $Shim = Join-Path $BinDir "opero.cmd"
  "@echo off`r`ncall `"$SourceCmd`" %*`r`n" | Set-Content -NoNewline -Encoding ASCII $Shim

  Write-Host "Installed opero $Tag"
  Write-Host "Binary: $Shim"
  & $Shim --version
} finally {
  Remove-Item -Recurse -Force $Tmp -ErrorAction SilentlyContinue
}
