<#-- Define custom variables for the page -->
<#-- The pageTitle and pageDescription are passed from the route handler -->

<div class="container mx-auto px-4 py-12">
    <div class="text-center">
        <div class="bg-blue-100 inline-flex p-6 rounded-full mb-6">
            <i class="fas fa-tools text-blue-500 text-4xl"></i>
        </div>
        
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
            <#if categoryName??>
                ${categoryName} Tools
            <#else>
                Coming Soon
            </#if>
        </h1>
        
        <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            We're currently working on this page. Please check back soon!
        </p>
        
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            <i class="fas fa-arrow-left mr-2"></i> Back to Home
        </a>
    </div>
    
    <div class="mt-16 max-w-3xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
        <h2 class="text-xl font-semibold mb-4">Available Tools</h2>
        
        <div class="space-y-3">
            <div class="bg-white p-4 rounded border border-gray-100 flex items-center">
                <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-4">
                    <i class="fas fa-code text-xl"></i>
                </div>
                <div>
                    <h3 class="font-medium">Base64 Encoder/Decoder</h3>
                    <p class="text-sm text-gray-600">Convert text to Base64, decode Base64 to text, and more</p>
                </div>
                <div class="ml-auto">
                    <a href="/base64" class="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors">
                        Use Tool
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>