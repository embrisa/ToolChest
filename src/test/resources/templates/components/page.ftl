<#-- Page Layout Macro -->
<#macro page title="" pageDescription="" showHeader=true showFooter=true>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${pageDescription}">
</head>
<body>
    <#if showHeader>
    <header>
        <h1>ToolChest</h1>
    </header>
    </#if>
    
    <main>
        <#nested>
    </main>
    
    <#if showFooter>
    <footer>
        <p>© 2025 ToolChest</p>
    </footer>
    </#if>
</body>
</html>
</#macro> 