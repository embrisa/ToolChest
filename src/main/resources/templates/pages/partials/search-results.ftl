<#-- 
Search Results Partial Template (for HTMX search responses)
Parameters:
- tools: List of ToolDTO objects to display as search results
- searchQuery: The query string that was searched for
-->
<#import "../../components/tool-card.ftl" as toolCard>

<!-- Tools Grid Section with Header -->
<div class="mb-6">
    <h2 class="text-2xl font-bold mb-4 border-b pb-2">
        <#if searchQuery?? && searchQuery != ''>
            Search Results for "${searchQuery}"
        <#else>
            Search Results
        </#if>
    </h2>
    
    <#if tools?? && tools?size gt 0>
        <div id="tool-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <#list tools as tool>
                <@toolCard.toolCard tool=tool />
            </#list>
        </div>
    <#else>
        <div class="text-center p-8 bg-gray-50 rounded-lg">
            <p class="text-gray-500 mb-4">
                No tools found matching your search. Try different keywords or browse all tools.
            </p>
            <a href="/" class="text-blue-600 hover:underline">
                <i class="fas fa-arrow-left mr-1"></i> Back to all tools
            </a>
        </div>
    </#if>
</div>