<#-- 
Tool Card Component for Testing
Parameters:
- tool: ToolDTO object with:
  - name: Name of the tool
  - description: Brief description of the tool
  - slug: URL path to the tool
  - tags: List of TagDTO objects
-->

<#macro toolCard tool>
<div class="bg-white card">
    <div class="card-content">
        <div class="tool-header">
            <h3>${tool.name}</h3>
        </div>
        
        <p>${tool.description}</p>
        
        <div class="tag-list">
            <#if tool.tags?? && tool.tags?size gt 0>
                <#list tool.tags as tag>
                    <a href="/tag/${tag.slug}" class="tag">${tag.name}</a>
                </#list>
            </#if>
        </div>
        
        <div class="tool-actions">
            <a href="/${tool.slug}" class="use-tool-button">Use Tool</a>
        </div>
    </div>
</div>
</#macro> 