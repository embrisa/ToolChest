<#-- Use the page macro from macros.ftl -->
<@page 
  title="Free Online Utility Tools"
  pageDescription="ToolChest offers free online utility tools including encoders, decoders, formatters, and more - no registration required."
>
<#-- Hero Section -->
<div class="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 mb-8 text-white">
    <div class="container mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">Your Toolkit for Everyday Tasks</h1>
        <p class="text-xl opacity-90 mb-6 max-w-2xl mx-auto">Free online utility tools to encode, decode, convert, and transform data. No registration required.</p>
        
        <div class="max-w-lg mx-auto">
            <div class="relative">
                <input type="text" placeholder="Search for a tool..." class="w-full py-3 px-4 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                <button class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 text-white rounded px-4 py-1">
                    <i class="fas fa-search mr-1"></i> Search
                </button>
            </div>
        </div>
    </div>
</div>

<#-- Popular Tools Section -->
<div class="container mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold mb-6">Popular Tools</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <#-- Base64 Encoder/Decoder Tool -->
        <#if availableTools?? && availableTools?size gt 0>
            <#list availableTools as tool>
                <@toolCard 
                    id=tool.id
                    name=tool.name
                    description=tool.description
                    icon=tool.icon
                    url=tool.url
                    isComingSoon=false
                />
            </#list>
        </#if>
        
        <#-- Example of other tools that would be available -->
        <@toolCard 
            id="json-formatter"
            name="JSON Formatter"
            description="Format, validate, and beautify JSON data with syntax highlighting."
            icon="fa-code"
            url="/tools/json-formatter"
            isComingSoon=true
        />
        
        <@toolCard 
            id="password-generator"
            name="Password Generator"
            description="Generate secure passwords with customizable options."
            icon="fa-unlock"
            url="/tools/password-generator"
            isComingSoon=true
        />
        
        <@toolCard 
            id="image-compressor"
            name="Image Compressor"
            description="Compress images without losing quality. Support for multiple formats."
            icon="fa-image"
            url="/tools/image-compressor"
            isComingSoon=true
        />
    </div>
</div>

<#-- Tools by Category Section -->
<div class="container mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold mb-6">Browse Tools by Category</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/category/encoders-decoders" class="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 text-center">
            <div class="bg-blue-100 inline-flex p-3 rounded-full mb-3">
                <i class="fas fa-exchange-alt text-blue-500 text-xl"></i>
            </div>
            <h3 class="font-semibold mb-2">Encoders & Decoders</h3>
            <p class="text-sm text-gray-600">Base64, URL, HTML and more</p>
        </a>
        
        <a href="/category/formatters" class="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 text-center">
            <div class="bg-green-100 inline-flex p-3 rounded-full mb-3">
                <i class="fas fa-code text-green-500 text-xl"></i>
            </div>
            <h3 class="font-semibold mb-2">Formatters</h3>
            <p class="text-sm text-gray-600">JSON, XML, SQL and more</p>
        </a>
        
        <a href="/category/converters" class="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 text-center">
            <div class="bg-purple-100 inline-flex p-3 rounded-full mb-3">
                <i class="fas fa-sync text-purple-500 text-xl"></i>
            </div>
            <h3 class="font-semibold mb-2">Converters</h3>
            <p class="text-sm text-gray-600">Units, images, documents</p>
        </a>
        
        <a href="/category/generators" class="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 text-center">
            <div class="bg-yellow-100 inline-flex p-3 rounded-full mb-3">
                <i class="fas fa-magic text-yellow-600 text-xl"></i>
            </div>
            <h3 class="font-semibold mb-2">Generators</h3>
            <p class="text-sm text-gray-600">Passwords, UUIDs, Lorem Ipsum</p>
        </a>
    </div>
</div>

<#-- About Section -->
<div class="container mx-auto px-4 mb-12">
    <div class="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-100">
        <h2 class="text-2xl font-bold mb-4">About ToolChest</h2>
        <p class="text-gray-700 mb-4">
            ToolChest is a collection of free web-based utility tools designed to help you with everyday tasks.
            All our tools are completely free to use with no account or registration required.
        </p>
        <p class="text-gray-700">
            Our mission is to provide high-quality tools that respect your privacy. We prioritize speed, security, 
            and ease of use in every tool we create.
        </p>
    </div>
</div>
</@page>