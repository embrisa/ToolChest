<#-- 
Tag Navigation Component for Testing
Parameters:
- allTags: List of all TagDTO objects
- currentTag: (Optional) Currently selected TagDTO object or slug string
-->

<#macro tagNavigation allTags currentTag=null>
<div class="tag-navigation">
    <a href="/" class="tag-nav-item ${(currentTag??)?then('', 'active')}"
       aria-current="${(currentTag??)?then('', 'page')}">
        All
    </a>
    
    <#if allTags?? && allTags?size gt 0>
        <#list allTags as tag>
            <#-- Handle both object and string type for currentTag -->
            <#assign isActive = false />
            <#if currentTag??>
                <#if currentTag?is_hash && currentTag.id??>
                    <#assign isActive = (currentTag.id == tag.id) />
                <#elseif currentTag?is_string>
                    <#assign isActive = (currentTag == tag.slug) />
                </#if>
            </#if>
            <a href="/tag/${tag.slug}" 
               class="tag-nav-item ${isActive?then('active', '')}"
               aria-current="${isActive?then('page', '')}">
                ${tag.name}
            </a>
        </#list>
    </#if>
</div>
</#macro> 