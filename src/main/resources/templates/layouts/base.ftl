<#macro page title="" description="">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<#if description??>${description}<#elseif pageDescription??>${pageDescription}<#else>Free online utility tools for everyday tasks</#if>">
    <title><#if title??>${title}<#elseif pageTitle??>${pageTitle} - ToolChest<#else>ToolChest - Free Online Utility Tools</#if></title>
    
    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- HTMX for dynamic interactions -->
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/static/css/main.css">
    
    <!-- Additional head content -->
    <#if headContent??>${headContent}</#if>
</head>
<body class="bg-gray-50 text-gray-800 flex flex-col min-h-screen">
    <!-- Header -->
    <#include "../components/header.ftl">
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 flex-grow">
        <#nested>
    </main>
    
    <!-- Footer -->
    <#include "../components/footer.ftl">
    
    <!-- Additional body scripts -->
    <#if bodyScripts??>${bodyScripts}</#if>
</body>
</html>
</#macro>