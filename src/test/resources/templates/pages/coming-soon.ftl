<#import "../components/page.ftl" as layout>

<@layout.page 
    title="${title}" 
    pageDescription="${pageDescription}"
>
    <div class="coming-soon">
        <h1>${title}</h1>
        <p>This page is coming soon. Please check back later.</p>
        <a href="/" class="back-button">Back to Home</a>
    </div>
</@layout.page> 