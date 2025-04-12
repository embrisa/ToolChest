<#-- 
Tag Navigation Component
Parameters:
- allTags: List of all TagDTO objects
- currentTag: The currently selected TagDTO object
-->

<#-- Tag navigation component - displays a list of clickable tags with the current one highlighted -->
<#macro tagNavigation allTags currentTag>
    <#if allTags?? && allTags?size gt 0>
        <div class="flex flex-wrap gap-2 mb-4">
            <#list allTags as tag>
                <a href="/tag/${tag.slug}" 
                   class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 
                         ${(currentTag?? && currentTag.id == tag.id)?then('bg-white text-blue-600 shadow-sm', 'bg-gray-700 text-white hover:bg-gray-800')}">
                    ${tag.name}
                </a>
            </#list>
        </div>
    </#if>
</#macro>

<#-- No self-rendering to avoid issues in tests -->
