$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot 'backend')
# Prefer an installed JDK rather than an older Java runtime.
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) {
    $jdk = Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'bin\javac.exe') } |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
    else {
        $env:JAVA_HOME = Read-Host 'Enter your JDK folder (for example C:\Program Files\Java\jdk-21)'
        if (-not (Test-Path (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) { throw 'JDK not found. Install JDK 21 and try again.' }
    }
}
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$env:Path"
$env:SPRING_PROFILES_ACTIVE = 'mysql'
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/peopleflow?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$dbUser = Read-Host 'MySQL username (press Enter for root)'
$env:DB_USERNAME = if ([string]::IsNullOrWhiteSpace($dbUser)) { 'root' } else { $dbUser }
function Read-Secret([string]$Prompt) {
    $secret = Read-Host $Prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
$env:DB_PASSWORD = Read-Secret 'MySQL password (your existing database password)'
Write-Host 'First launch: enter a new administrator email and password. Later launches: press Enter at the email prompt.'
$env:ADMIN_EMAIL = Read-Host 'First administrator email'
if (-not [string]::IsNullOrWhiteSpace($env:ADMIN_EMAIL)) {
    $env:ADMIN_NAME = Read-Host 'Administrator full name'
    $env:ADMIN_PASSWORD = Read-Secret 'New login password (at least 12 characters; separate from MySQL password)'
}
try {
    & .\mvnw.cmd spring-boot:run
} finally {
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_NAME -ErrorAction SilentlyContinue
}
