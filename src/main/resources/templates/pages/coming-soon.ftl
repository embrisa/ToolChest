<#import "../layouts/base.ftl" as layout>

<@layout.page title=title pageDescription=pageDescription>
    <div class="container mx-auto px-4 py-8 text-center">
        <div class="bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto">
            <i class="fas fa-tools text-5xl text-primary mb-4"></i>
            <h1 class="text-3xl font-bold mb-4">${title}</h1>
            <p class="text-gray-600 mb-6">This page is coming soon! We're working hard to bring you more tools and features.</p>
            <a href="/" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                Back to Home
            </a>
        </div>
    </div>
</@layout.page>