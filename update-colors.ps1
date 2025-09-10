# PowerShell script to update all old colors to new ones
$files = Get-ChildItem -Recurse -Include "*.tsx","*.ts","*.jsx","*.js" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace background colors
    $content = $content -replace 'bg-emerald-', 'bg-primary-'
    $content = $content -replace 'bg-teal-', 'bg-secondary-'
    $content = $content -replace 'bg-cyan-', 'bg-primary-'
    $content = $content -replace 'bg-blue-', 'bg-primary-'
    $content = $content -replace 'bg-green-', 'bg-secondary-'
    $content = $content -replace 'bg-purple-', 'bg-primary-'
    $content = $content -replace 'bg-pink-', 'bg-secondary-'
    $content = $content -replace 'bg-orange-', 'bg-secondary-'
    $content = $content -replace 'bg-yellow-', 'bg-secondary-'
    
    # Replace text colors
    $content = $content -replace 'text-emerald-', 'text-primary-'
    $content = $content -replace 'text-teal-', 'text-secondary-'
    $content = $content -replace 'text-cyan-', 'text-primary-'
    $content = $content -replace 'text-blue-', 'text-primary-'
    $content = $content -replace 'text-green-', 'text-secondary-'
    $content = $content -replace 'text-purple-', 'text-primary-'
    $content = $content -replace 'text-pink-', 'text-secondary-'
    $content = $content -replace 'text-orange-', 'text-secondary-'
    $content = $content -replace 'text-yellow-', 'text-secondary-'
    
    # Replace gradient colors
    $content = $content -replace 'from-emerald-', 'from-primary-'
    $content = $content -replace 'from-teal-', 'from-secondary-'
    $content = $content -replace 'from-cyan-', 'from-primary-'
    $content = $content -replace 'from-blue-', 'from-primary-'
    $content = $content -replace 'from-green-', 'from-secondary-'
    $content = $content -replace 'from-purple-', 'from-primary-'
    $content = $content -replace 'from-pink-', 'from-secondary-'
    $content = $content -replace 'from-orange-', 'from-secondary-'
    $content = $content -replace 'from-yellow-', 'from-secondary-'
    
    $content = $content -replace 'to-emerald-', 'to-primary-'
    $content = $content -replace 'to-teal-', 'to-secondary-'
    $content = $content -replace 'to-cyan-', 'to-primary-'
    $content = $content -replace 'to-blue-', 'to-primary-'
    $content = $content -replace 'to-green-', 'to-secondary-'
    $content = $content -replace 'to-purple-', 'to-primary-'
    $content = $content -replace 'to-pink-', 'to-secondary-'
    $content = $content -replace 'to-orange-', 'to-secondary-'
    $content = $content -replace 'to-yellow-', 'to-secondary-'
    
    # Replace border colors
    $content = $content -replace 'border-emerald-', 'border-primary-'
    $content = $content -replace 'border-teal-', 'border-secondary-'
    $content = $content -replace 'border-cyan-', 'border-primary-'
    $content = $content -replace 'border-blue-', 'border-primary-'
    $content = $content -replace 'border-green-', 'border-secondary-'
    $content = $content -replace 'border-purple-', 'border-primary-'
    $content = $content -replace 'border-pink-', 'border-secondary-'
    $content = $content -replace 'border-orange-', 'border-secondary-'
    $content = $content -replace 'border-yellow-', 'border-secondary-'
    
    # Replace ring colors
    $content = $content -replace 'ring-emerald-', 'ring-primary-'
    $content = $content -replace 'ring-teal-', 'ring-secondary-'
    $content = $content -replace 'ring-cyan-', 'ring-primary-'
    $content = $content -replace 'ring-blue-', 'ring-primary-'
    $content = $content -replace 'ring-green-', 'ring-secondary-'
    $content = $content -replace 'ring-purple-', 'ring-primary-'
    $content = $content -replace 'ring-pink-', 'ring-secondary-'
    $content = $content -replace 'ring-orange-', 'ring-secondary-'
    $content = $content -replace 'ring-yellow-', 'ring-secondary-'
    
    # Write back to file
    Set-Content $file.FullName -Value $content -NoNewline
}

Write-Host "Color update completed!"
