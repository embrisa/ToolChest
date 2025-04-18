<#-- 
Tag Navigation Component
Parameters:
- allTags: List of all TagDTO objects
- currentTag: (Optional) Currently selected TagDTO object or slug string
-->

<#macro tagNavigation allTags currentTag=null>
<div class="flex flex-wrap items-center gap-2">
    <a href="/" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors ${(currentTag??)?then('', 'font-medium bg-blue-100 text-blue-700')}"
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
               class="px-3 py-1 rounded-md hover:bg-gray-200 transition-colors ${isActive?then('font-medium bg-blue-100 text-blue-700', 'bg-gray-100 text-gray-700')}"
               aria-current="${isActive?then('page', '')}"
               style="">
                ${tag.name}
            </a>
        </#list>
    </#if>
</div>
</#macro>

<#-- No self-rendering to avoid issues in tests -->
