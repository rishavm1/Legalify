#!/usr/bin/env pwsh
# Script to implement UI reconfiguration changes for Legalify

Write-Host "🔧 Implementing UI Reconfiguration Changes..." -ForegroundColor Cyan

# Change 1: Remove FeatureButtons import from chat-interface.tsx
Write-Host "`n1️⃣ Removing FeatureButtons import..."
$chatInterface = Get-Content "components/chat-interface.tsx" -Raw
$chatInterface = $chatInterface -replace "import \{ FeatureButtons \} from '@/components/feature-buttons';`r?`n", ""
Set-Content "components/chat-interface.tsx" -Value $chatInterface -NoNewline

# Change 2: Update sidebar z-index from z-40 to z-50
Write-Host "2️⃣ Updating sidebar z-index to z-50..."
$chatInterface = Get-Content "components/chat-interface.tsx" -Raw
$chatInterface = $chatInterface -replace 'z-40 bg-neutral-100', 'z-50 bg-neutral-100'
Set-Content "components/chat-interface.tsx" -Value $chatInterface -NoNewline

# Change 3: Update sign-out redirect from /auth/signin to /login
Write-Host "3️⃣ Updating sign-out redirect to /login..."
$chatInterface = Get-Content "components/chat-interface.tsx" -Raw
$chatInterface = $chatInterface -replace "window.location.href = '/auth/signin';", "window.location.href = '/login';"
Set-Content "components/chat-interface.tsx" -Value $chatInterface -NoNewline

Write-Host "`n✅ All changes applied successfully!" -ForegroundColor Green
Write-Host "`nChanges made:" -ForegroundColor Yellow
Write-Host "  • Removed FeatureButtons component import"
Write-Host "  • Updated sidebar z-index from z-40 to z-50" 
Write-Host "  • Changed sign-out redirect from /auth/signin to /login"
