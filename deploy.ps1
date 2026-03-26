$appData = [System.Environment]::GetFolderPath('ApplicationData')
$target = "$appData\Adobe\CEP\extensions\com.tima.dialogue"
$source = Get-Item .

Write-Host "--- Начинаю деплой ---" -ForegroundColor Yellow

# 1. Жестко удаляем старую папку целиком
if (Test-Path $target) {
    Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Старая версия удалена." -ForegroundColor Gray
}

# 2. Создаем чистую папку
New-Item -ItemType Directory -Force -Path $target | Out-Null

# 3. Копируем только нужные файлы (исключаем мусор)
Copy-Item -Path "$source\*" -Destination $target -Recurse -Force -Exclude ".vscode", "deploy.ps1", ".git", "*.md"

Write-Host "Новые файлы успешно скопированы в: $target" -ForegroundColor Green
Write-Host "ВАЖНО: Перезапусти панель в Premiere (Ctrl+R или закрой/открой)." -ForegroundColor Cyan