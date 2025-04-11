<#-- Common macros for ToolChest templates -->

<#-- Macro for rendering page title -->
<#macro pageTitle title="">
    <#if title?has_content>
        ${title} - ToolChest
    <#else>
        ToolChest - Free Online Utility Tools
    </#if>
</#macro>

<#-- Macro for rendering page content in base layout -->
<#macro page title="" pageDescription="" headContent="" bodyScripts="">
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${pageDescription?if_exists}">
        <title><@pageTitle title=title /></title>
        
        <!-- Tailwind CSS via CDN -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- HTMX for dynamic interactions -->
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        
        <!-- Font Awesome for icons -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        
        <!-- Custom CSS -->
        <link rel="stylesheet" href="/static/css/main.css">
        
        <!-- Additional head content -->
        <#if headContent?has_content>${headContent}</#if>
    </head>
    <body class="bg-gray-50 text-gray-800 flex flex-col min-h-screen">
        <!-- Header -->
        <#include "header.ftl">
        
        <!-- Main Content -->
        <main class="container mx-auto px-4 py-6 flex-grow">
            <#nested>
        </main>
        
        <!-- Footer -->
        <#include "footer.ftl">
        
        <!-- Custom JavaScript -->
        <script src="/static/js/main.js"></script>
        
        <!-- Additional body scripts -->
        <#if bodyScripts?has_content>${bodyScripts}</#if>
    </body>
    </html>
</#macro>

<#-- Macro for rendering a tool card -->
<#macro toolCard id name description icon url isComingSoon=false>
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div class="p-5">
            <div class="flex items-center mb-3">
                <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-3">
                    <i class="fas ${icon} text-xl"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold">
                        ${name}
                        <#if isComingSoon == false>
                            <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Popular</span>
                        </#if>
                    </h3>
                </div>
            </div>
            <p class="text-gray-600 text-sm mb-4">${description}</p>
            <#if isComingSoon>
                <div class="inline-block bg-gray-200 text-gray-500 rounded px-4 py-2 text-sm cursor-not-allowed">
                    Coming Soon
                </div>
            <#else>
                <a href="${url}" class="inline-block bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 transition-colors">
                    Use Tool
                </a>
            </#if>
        </div>
    </div>
</#macro>