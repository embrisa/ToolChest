<#import "../layouts/base.ftl" as layout>
<#import "../components/tool-card.ftl" as toolCard>
<#import "../components/tag-navigation.ftl" as tagNav>

<@layout.page title="ToolChest - Free Online Tools" 
              description="ToolChest offers a collection of free online utility tools to simplify your daily tasks.">
    
    <div class="container mx-auto px-4 py-6">
        <!-- Hero Section -->
        <div class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold mb-4">Free Online Tools</h1>
            <p class="text-gray-600 max-w-2xl mx-auto">
                Welcome to ToolChest! We provide a collection of free, useful online tools to help you with everyday tasks.
            </p>
        </div>
        
        <!-- Search Section -->
        <div class="max-w-2xl mx-auto mb-6">
            <form hx-post="/search" hx-target="#tool-container" hx-swap="innerHTML" class="flex w-full">
                <input type="text" 
                       name="query" 
                       placeholder="Search for tools or tags..." 
                       value="${searchQuery!''}"
                       class="flex-1 p-3 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       aria-label="Search for tools">
                <button type="submit" class="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 transition-colors">
                    <i class="fas fa-search mr-1"></i> Search
                </button>
            </form>
        </div>
        
        <!-- Tag Navigation -->
        <div class="mb-8">
            <h2 class="text-lg font-medium mb-2">Filter by Tag:</h2>
            <@tagNav.tagNavigation allTags=allTags currentTag=tag!'' />
        </div>
        
        <div id="tool-container">
            <!-- Popular Tools Section - Only show on main page, not search results -->
            <#if popularTools?? && popularTools?size gt 0 && (!searchQuery?? || searchQuery == '')>
                <div class="mb-8">
                    <h2 class="text-2xl font-bold mb-4 border-b pb-2">Popular Tools</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <#list popularTools as tool>
                            <@toolCard.tool tool=tool />
                        </#list>
                    </div>
                </div>
            </#if>
            
            <!-- Tools Grid Section -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold mb-4 border-b pb-2">
                    <#if searchQuery?? && searchQuery != ''>
                        Search Results
                    <#elseif tag??>
                        ${tag.name} Tools
                    <#else>
                        All Tools
                    </#if>
                </h2>
                
                <#if availableTools?? && availableTools?size gt 0>
                    <div id="tool-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <#list availableTools as tool>
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
                        
                        <#-- Load More Button -->
                        <#if showLoadMore?? && showLoadMore>
                            <div id="load-more-container" class="col-span-full text-center mt-4">
                                <button id="load-more-btn" 
                                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        hx-get="/tools/more?offset=${availableTools?size}&limit=9<#if tag??>&tag=${tag.slug}</#if>"
                                        hx-target="#tool-grid"
                                        hx-swap="beforeend"
                                        hx-trigger="click">
                                    Load More Tools
                                </button>
                            </div>
                        </#if>
                    </div>
                <#else>
                    <div class="text-center p-8 bg-gray-50 rounded-lg">
                        <p class="text-gray-500 mb-4">
                            <#if searchQuery?? && searchQuery != ''>
                                No tools found matching your search. Try different keywords or browse all tools.
                            <#else>
                                No tools available yet. Check back soon!
                            </#if>
                        </p>
                        <#if searchQuery?? && searchQuery != ''>
                            <a href="/" class="text-blue-600 hover:underline">
                                <i class="fas fa-arrow-left mr-1"></i> Back to all tools
                            </a>
                        </#if>
                    </div>
                </#if>
            </div>
        </div>
    </div>
    
</@layout.page>