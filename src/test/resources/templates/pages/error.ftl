<#import "../components/page.ftl" as layout>

<@layout.page 
    title=pageTitle 
    pageDescription=pageDescription
    showHeader=true
    showFooter=true
>
    <div class="error-container">
        <h1>Error ${error.errorCode}</h1>
        <h2>${error.errorTitle}</h2>
        <p>${error.errorMessage}</p>
        <p>${error.suggestedAction}</p>
        
        <#if error.errorCode == 400>
            <p>This could be due to Invalid Base64 input.</p>
        </#if>
        
        <#if error.showBackLink?? && error.showBackLink>
            <a href="javascript:history.back()">Go Back</a>
        </#if>
    </div>
</@layout.page> 