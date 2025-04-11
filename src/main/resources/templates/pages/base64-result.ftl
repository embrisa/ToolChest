<div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
        <#if operation == "encode">
            Text to Base64 Result
        <#elseif operation == "decode">
            Base64 to Text Result
        <#elseif operation == "fileEncode">
            File to Base64 Result
        </#if>
    </h2>
    
    <#if operation == "fileEncode">
        <div class="mb-4">
            <span class="font-medium">File name:</span> ${fileName}
        </div>
    </#if>
    
    <#if operation == "encode" || operation == "decode">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Input length: ${inputLength} characters</span>
            <span>Output length: ${outputLength} characters</span>
        </div>
    <#elseif operation == "fileEncode">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Output length: ${outputLength} characters</span>
        </div>
    </#if>
    
    <div class="relative">
        <textarea id="result-text" rows="8" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" readonly>${result}</textarea>
        <button onclick="copyToClipboard('result-text')" 
                class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
        </button>
    </div>
    
    <div class="mt-6 flex space-x-4">
        <button onclick="window.location.reload()" 
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            New Conversion
        </button>
        
        <#if operation == "encode" || operation == "fileEncode">
            <button onclick="switchToDecoder('${result}')" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Decode This Result
            </button>
        <#elseif operation == "decode">
            <button onclick="switchToEncoder('${result}')" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Encode This Result
            </button>
        </#if>
    </div>
</div>

<script>
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Visual feedback
    const button = element.nextElementSibling;
    const originalText = button.innerHTML;
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>Copied!';
    
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

function switchToDecoder(text) {
    // Get and click the decode tab button
    document.getElementById('text-decode-tab').click();
    
    // Set the text in the decode textarea
    document.getElementById('decode-text').value = text;
    
    // Scroll to the form
    document.getElementById('text-decode').scrollIntoView({ behavior: 'smooth' });
}

function switchToEncoder(text) {
    // Get and click the encode tab button
    document.getElementById('text-encode-tab').click();
    
    // Set the text in the encode textarea
    document.getElementById('encode-text').value = text;
    
    // Scroll to the form
    document.getElementById('text-encode').scrollIntoView({ behavior: 'smooth' });
}
</script>