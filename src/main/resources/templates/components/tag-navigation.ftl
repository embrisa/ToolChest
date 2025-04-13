<#-- 
Tag Navigation Component
Parameters:
- allTags: List of all TagDTO objects
- currentTag: The currently selected TagDTO object (optional)
-->

<#-- Tag navigation component - displays a list of clickable tags with the current one highlighted -->
<#macro tagNavigation allTags currentTag="">
    <#if allTags?? && allTags?size gt 0>
        <div class="flex flex-wrap gap-2 mb-4">
            <a href="/" 
               class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 
                     ${(currentTag == '')?then('bg-blue-600 text-white shadow-sm', 'bg-gray-100 text-gray-700 hover:bg-gray-200')}">
                All Tools
            </a>
            <#list allTags as tag>
                <a href="/tag/${tag.slug}" 
                   class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 
                         ${(currentTag?? && currentTag?is_hash && currentTag.id == tag.id)?then('bg-blue-600 text-white shadow-sm', 'bg-gray-100 text-gray-700 hover:bg-gray-200')}"
                   hx-boost="true">
                    ${tag.name}
                </a>
            </#list>
        </div>
    </#if>
</#macro>

<#-- No self-rendering to avoid issues in tests -->
