<#-- Main page layout macro -->
<#macro page title="" pageDescription="" metaImage="">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${pageDescription}">
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="/static/css/main.css">
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">
    <#-- Header -->
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" class="text-xl font-bold text-blue-600">ToolChest</a>
            <nav>
                <ul class="flex space-x-6">
                    <li><a href="/" class="text-gray-600 hover:text-blue-600">Home</a></li>
                    <li><a href="/about" class="text-gray-600 hover:text-blue-600">About</a></li>
                </ul>
            </nav>
        </div>
    </header>
    
    <#-- Content -->
    <main class="flex-grow">
        <#nested>
    </main>
    
    <#-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="text-center">
                <p>&copy; ${.now?string('yyyy')} ToolChest. All rights reserved.</p>
                <div class="mt-2">
                    <a href="/about" class="text-gray-300 hover:text-white mx-2">About</a>
                    <a href="/privacy" class="text-gray-300 hover:text-white mx-2">Privacy</a>
                    <a href="/terms" class="text-gray-300 hover:text-white mx-2">Terms</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
</#macro>

<#-- Include all component definitions directly -->
<#include "/components/tool-card.ftl">
<#include "/components/tag-navigation.ftl">