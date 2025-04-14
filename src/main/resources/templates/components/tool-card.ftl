<#-- 
Tool Card Component
Parameters:
- tool: ToolDTO object with:
  - name: Name of the tool
  - description: Brief description of the tool
  - iconClass: Font Awesome icon class (e.g., "fa-code")
  - slug: URL path to the tool
  - tags: List of TagDTO objects
-->

<#macro toolCard tool>
<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
    <div class="p-5">
        <div class="flex items-center mb-3">
            <div class="bg-blue-100 text-blue-600 rounded-full p-3 mr-3">
                <i class="fas ${tool.iconClass!'fa-tools'} text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold">${tool.name}</h3>
        </div>
        
        <p class="text-gray-600 mb-4 text-sm">${tool.description}</p>
        
        <div class="flex justify-between items-center">
            <div class="flex flex-wrap gap-1 mb-2">
                <#if tool.tags?? && tool.tags?size gt 0>
                    <#list tool.tags as tag>
                        <a href="/tag/${tag.slug}" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" 
                           style="background-color: ${tag.color}25; color: ${tag.color};">
                            ${tag.name}
                        </a>
                    </#list>
                </#if>
            </div>
            
            <a href="/${tool.slug}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-sm transition-colors">
                Use Tool
            </a>
        </div>
    </div>
</div>
</#macro>