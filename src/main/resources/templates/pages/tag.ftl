<#-- Use the page macro from macros.ftl -->
<@page 
  title="${tag.name} Tools - ToolChest"
  pageDescription="Browse ${tag.name} tools in ToolChest - Free online utility tools with no registration required."
>
<#-- Tag Hero Section -->
<div class="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 mb-8 text-white">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold mb-2">${tag.name} Tools</h1>
        <p class="opacity-90 mb-6">${tag.description!''}</p>
        
        <#-- Tag Navigation -->
        <@tagNavigation allTags=allTags currentTag=tag />
    </div>
</div>

<#-- Tools Grid Section -->
<div class="container mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold mb-6">Available ${tag.name} Tools</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <#if tools?? && tools?size gt 0>
            <#list tools as tool>
                <@toolCard tool=tool />
            </#list>
        <#else>
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500 mb-4">No tools found with this tag.</p>
                <a href="/" class="text-blue-600 hover:underline">
                    <i class="fas fa-arrow-left mr-1"></i> Back to all tools
                </a>
            </div>
        </#if>
    </div>
</div>

<#-- Popular Tools Section -->
<div class="container mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold mb-6">Other Popular Tools</h2>
    
    <#-- List of popular tools from other categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <#-- Show up to 4 popular tools from other categories -->
        <#if popularTools?? && popularTools?size gt 0>
            <#list popularTools as tool>
                <#if tool.slug != tag.slug> <#-- Don't show tools from current tag -->
                    <a href="/tools/${tool.slug}" class="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300">
                        <div class="flex items-center">
                            <div class="bg-gray-100 inline-flex p-2 rounded-full mr-3">
                                <i class="fas ${tool.iconClass!'fa-code'} text-blue-500"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold">${tool.name}</h3>
                                <div class="flex mt-1">
                                    <#list tool.tags as toolTag>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1" 
                                              style="background-color: ${toolTag.color}25; color: ${toolTag.color};">
                                            ${toolTag.name}
                                        </span>
                                    </#list>
                                </div>
                            </div>
                        </div>
                    </a>
                </#if>
            </#list>
        </#if>
    </div>
</div>

<#-- Back to Home -->
<div class="container mx-auto px-4 mb-12 text-center">
    <a href="/" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <i class="fas fa-home mr-2"></i> Back to All Tools
    </a>
</div>
</@page>