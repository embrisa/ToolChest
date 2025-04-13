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
        
        <!-- Tailwind CSS via CDN with theme customization -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#3b82f6',
                  'primary-dark': '#2563eb',
                  secondary: '#10b981',
                  accent: '#8b5cf6',
                },
                fontFamily: {
                  sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                },
                boxShadow: {
                  'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }
            }
          }
        </script>
        
        <!-- Inter font -->
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
        
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

<#-- Enhanced toolCard macro with better hover effects -->
<#macro toolCard id name description icon="fa-tools" url="" isComingSoon=false>
    <div class="bg-white rounded-lg shadow-soft hover:shadow-hover transition-all duration-300 overflow-hidden hover:translate-y-[-2px]">
        <div class="p-5">
            <div class="flex items-center mb-3">
                <div class="bg-blue-100 text-primary rounded-full p-3 mr-3">
                    <i class="fas ${icon} text-xl"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold">
                        ${name}
                        <#if isComingSoon == false>
                            <span class="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full ml-2">Popular</span>
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
                <a href="${url}" class="inline-block bg-primary hover:bg-primary-dark text-white rounded px-4 py-2 text-sm transition-colors">
                    Use Tool
                </a>
            </#if>
        </div>
    </div>
</#macro>