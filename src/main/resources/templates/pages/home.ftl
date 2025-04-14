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
            <!-- Tools Grid Section -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold mb-4 border-b pb-2">
                    <#if searchQuery?? && searchQuery != ''>
                        Search Results
                    <#elseif tag??>
                        ${tag.name} Tools
                    <#else>
                        <#if popularTools?? && popularTools?size gt 0>Popular Tools<#else>All Tools</#if>
                    </#if>
                </h2>
                
                <#if (availableTools?? && availableTools?size gt 0) || (popularTools?? && popularTools?size gt 0)>
                    <div id="tool-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <#-- First show popular tools if available and not searching -->
                        <#if popularTools?? && popularTools?size gt 0 && (!searchQuery?? || searchQuery == '') && (!tag??)>
                            <#list popularTools as tool>
                                <@toolCard.toolCard tool=tool />
                            </#list>
                        <#-- Otherwise show regular tools -->
                        <#elseif availableTools?? && availableTools?size gt 0>
                            <#list availableTools as tool>
                                <@toolCard.toolCard tool=tool />
                            </#list>
                        </#if>
                        
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