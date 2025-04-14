<#-- 
Tool Grid Items Partial Template (for HTMX dynamic loading)
Parameters:
- tools: List of ToolDTO objects
- showLoadMore: Boolean indicating if there are more tools to load
-->
<#import "../../components/tool-card.ftl" as toolCard>

<#if tools?? && tools?size gt 0>
    <#list tools as tool>
        <@toolCard.toolCard tool=tool />
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