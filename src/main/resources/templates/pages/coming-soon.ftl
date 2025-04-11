<#-- Use the page macro from macros.ftl -->
<@page 
  title=pageTitle!'Coming Soon'
  pageDescription=pageDescription!'This feature is coming soon to ToolChest.'
>
<div class="max-w-2xl mx-auto text-center py-12">
    <div class="bg-blue-50 border border-blue-100 rounded-xl p-8 mb-8">
        <div class="inline-flex p-4 bg-blue-100 text-blue-500 rounded-full mb-4">
            <i class="fas fa-tools text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold mb-4">${pageTitle!'Coming Soon'}</h1>
        <p class="text-xl text-gray-600 mb-8">We're working hard to bring this feature to you soon!</p>
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Return to Home
        </a>
    </div>
    
    <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6">Try Our Available Tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/base64" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex items-center">
                <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-4">
                    <i class="fas fa-code text-xl"></i>
                </div>
                <div class="text-left">
                    <h3 class="font-semibold mb-1">Base64 Encoder/Decoder</h3>
                    <p class="text-sm text-gray-600">Convert text or files to and from Base64</p>
                </div>
            </a>
        </div>
    </div>
</div>
</@page>