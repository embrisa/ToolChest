<#-- 
Tool Card Component
Parameters:
- Direct ToolDTO object OR
- Individual parameters:
  - name: Name of the tool
  - description: Brief description of the tool
  - icon: Font Awesome icon class (e.g., "fa-code")
  - url: URL path to the tool
  - isPopular: (Optional) Boolean to indicate if it's a popular tool
-->

<#-- Version 1: Accept individual parameters -->
<#macro toolCardWithParams id="" name="" description="" icon="" url="" isComingSoon=false isPopular=false>
<div class="tool-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-5">
        <div class="flex items-center mb-3">
            <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-3">
                <i class="fas ${icon} text-xl"></i>
            </div>
            <div>
                <h3 class="text-lg font-semibold">
                    ${name}
                    <#if isPopular>
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Popular</span>
                    </#if>
                </h3>
            </div>
        </div>
        
        <p class="text-gray-600 text-sm mb-4">${description}</p>
        
        <a href="${url}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm transition-colors duration-200">
            Use Tool
        </a>
    </div>
</div>
</#macro>

<#-- Version 2: Accept a complete ToolDTO object -->
<#macro toolCardFromObject tool>
<div class="tool-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-5">
        <div class="flex items-center mb-3">
            <div class="bg-blue-100 text-blue-500 rounded-full p-3 mr-3">
                <i class="fas ${tool.iconClass!'fa-code'} text-xl"></i>
            </div>
            <div>
                <h3 class="text-lg font-semibold">
                    ${tool.name}
                    <#if tool.usageCount gt 5>
                        <span class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Popular</span>
                    </#if>
                </h3>
            </div>
        </div>
        
        <p class="text-gray-600 text-sm mb-4">${tool.description}</p>
        
        <#-- Display tags if available -->
        <#if tool.tags?? && tool.tags?size gt 0>
        <div class="mt-2 mb-4">
            <#list tool.tags as tag>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1" 
                      style="background-color: ${tag.color}25; color: ${tag.color};">
                    ${tag.name}
                </span>
            </#list>
        </div>
        </#if>
        
        <a href="/tools/${tool.slug}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm transition-colors duration-200">
            Use Tool
        </a>
    </div>
</div>
</#macro>

<#-- Wrapper macro to detect which version to use -->
<#macro toolCard tool="" id="" name="" description="" icon="" url="" isComingSoon=false isPopular=false>
    <#if tool?? && tool?is_hash>
        <@toolCardFromObject tool=tool />
    <#else>
        <@toolCardWithParams id=id name=name description=description icon=icon url=url isComingSoon=isComingSoon isPopular=isPopular />
    </#if>
</#macro>

<#-- No self-rendering to avoid issues in tests -->