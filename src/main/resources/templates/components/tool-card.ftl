<#-- 
Tool Card Component
Parameters:
- toolName: Name of the tool
- toolDescription: Brief description of the tool
- toolIcon: Font Awesome icon class (e.g., "fa-code")
- toolUrl: URL path to the tool
- isPopular: (Optional) Boolean to indicate if it's a popular tool
-->

<#macro tool_card toolName toolDescription toolIcon toolUrl isPopular=false>
<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-5">
        <div class="flex items-center mb-3">
            <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-3">
                <i class="fas ${toolIcon} text-xl"></i>
            </div>
            <div>
                <h3 class="text-lg font-semibold">
                    ${toolName}
                    <#if isPopular>
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Popular</span>
                    </#if>
                </h3>
            </div>
        </div>
        
        <p class="text-gray-600 text-sm mb-4">${toolDescription}</p>
        
        <a href="${toolUrl}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm transition-colors duration-200">
            Use Tool
        </a>
    </div>
</div>
</#macro>