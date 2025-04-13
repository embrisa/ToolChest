<#-- 
Tool Grid Items Partial Template (for HTMX dynamic loading)
Parameters:
- tools: List of ToolDTO objects
- showLoadMore: Boolean indicating if there are more tools to load
-->

<#if tools?? && tools?size gt 0>
    <#list tools as tool>
        <div class="tool-item">
            <a href="/${tool.slug}" class="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 h-full">
                <div class="p-5">
                    <div class="flex items-start">
                        <div class="bg-blue-100 rounded-full p-3 mr-4">
                            <i class="fas ${tool.iconClass!'fa-code'} text-blue-600"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg mb-1">${tool.name}</h3>
                            <p class="text-gray-600 text-sm">${tool.description}</p>
                            
                            <#-- Display tags -->
                            <#if tool.tags?? && tool.tags?size gt 0>
                                <div class="mt-3 flex flex-wrap gap-1.5">
                                    <#list tool.tags as tag>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" 
                                              style="background-color: ${tag.color}25; color: ${tag.color};">
                                            ${tag.name}
                                        </span>
                                    </#list>
                                </div>
                            </#if>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </#list>
</#if>

<#-- Load more button -->
<#if showLoadMore?? && showLoadMore>
    <div id="load-more-container" class="col-span-full text-center mt-4">
        <button id="load-more-btn" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                hx-get="/tools/more?offset=${tools?size}&limit=9<#if tagSlug??>&tag=${tagSlug}</#if>"
                hx-target="#tool-grid"
                hx-swap="beforeend"
                hx-trigger="click">
            Load More Tools
        </button>
    </div>
</#if>