<#import "../components/page.ftl" as layout>

<@layout.page 
    title="Base64 Result" 
    pageDescription="Result of Base64 operation"
>
    <div class="result-container">
        <h1>Base64 ${operation}</h1>
        
        <div class="stats">
            <p>Input length: ${inputLength}</p>
            <p>Output length: ${outputLength}</p>
        </div>
        
        <div class="result">
            <#if operation == "decode" || operation == "encode">
                <textarea id="result-text">${result}</textarea>
            <#elseif operation == "fileEncode">
                <textarea id="result-text">${result}</textarea>
                <p>Original file: ${fileName}</p>
            <#elseif operation == "fileDecode">
                <#if error??>
                    <p>Error: ${error}</p>
                <#else>
                    <p>File download should begin automatically</p>
                </#if>
            </#if>
        </div>
        
        <a href="/base64" class="back-button">Back to Base64 Tool</a>
    </div>
</@layout.page> 