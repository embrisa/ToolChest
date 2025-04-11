<#-- Error page template -->
<#-- @ftlvariable name="error" type="com.toolchest.config.ErrorPageModel" -->
<#-- @ftlvariable name="pageTitle" type="String" -->
<#-- @ftlvariable name="pageDescription" type="String" -->

<@page title=pageTitle pageDescription=pageDescription>
    <div class="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
        <div class="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
            <div class="mb-6">
                <div class="inline-flex justify-center items-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-3">
                    <#if error.errorCode == 404>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    <#elseif error.errorCode == 403>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    <#else>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </#if>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">${error.errorCode} - ${error.errorTitle}</h1>
            </div>
            
            <p class="text-gray-600 mb-6">${error.errorMessage}</p>
            
            <#if error.suggestedAction??>
                <p class="text-sm text-gray-500 mb-8">${error.suggestedAction}</p>
            </#if>
            
            <div class="flex flex-wrap justify-center gap-4">
                <#if error.showHomeLink>
                    <a href="/" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Go to Homepage
                    </a>
                </#if>
                
                <#if error.showBackLink>
                    <button onclick="history.back()" class="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Go Back
                    </button>
                </#if>
            </div>
        </div>
    </div>
</@page>