<#-- 
Tool Grid Items Partial Template for Testing (for HTMX dynamic loading)
Parameters:
- tools: List of ToolDTO objects
- showLoadMore: Boolean indicating if there are more tools to load
-->

<#if tools?? && tools?size gt 0>
    <div class="tool-grid">
        <#list tools as tool>
            <div class="tool-item">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <a href="/${tool.slug}">Use Tool</a>
            </div>
        </#list>
    </div>
<#else>
    <div class="no-tools-message">
        <p>No tools available.</p>
    </div>
</#if>

<#-- Load more button -->
<#if showLoadMore?? && showLoadMore>
    <div id="load-more-container" class="col-span-full text-center mt-4">
        <button id="load-more-btn">Load More Tools</button>
    </div>
</#if> 