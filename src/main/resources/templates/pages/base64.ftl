<#-- Use the page macro from macros.ftl -->
<@page 
  title="Base64 Encoder and Decoder"
  pageDescription="Free online Base64 encoder and decoder. Convert text to Base64, decode Base64 to text, encode files to Base64, and convert Base64 back to files."
>
<div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Base64 Encoder and Decoder</h1>
    
    <div class="mb-10">
        <p class="mb-4">
            Base64 is a group of binary-to-text encoding schemes that represent binary data in an ASCII string format 
            by translating it into a radix-64 representation. It's commonly used when there is a need to encode binary 
            data that needs to be stored and transferred over media that are designed to deal with text.
        </p>
    </div>
    
    <!-- Tab navigation -->
    <div class="mb-6 border-b border-gray-200">
        <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="base64Tabs" role="tablist">
            <li class="mr-2" role="presentation">
                <button class="inline-block p-4 border-b-2 rounded-t-lg border-blue-600 text-blue-600 active" 
                        id="text-encode-tab" data-tab="text-encode" type="button" role="tab" aria-selected="true">
                    Text to Base64
                </button>
            </li>
            <li class="mr-2" role="presentation">
                <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300" 
                        id="text-decode-tab" data-tab="text-decode" type="button" role="tab" aria-selected="false">
                    Base64 to Text
                </button>
            </li>
            <li class="mr-2" role="presentation">
                <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300" 
                        id="file-encode-tab" data-tab="file-encode" type="button" role="tab" aria-selected="false">
                    File to Base64
                </button>
            </li>
            <li role="presentation">
                <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300" 
                        id="file-decode-tab" data-tab="file-decode" type="button" role="tab" aria-selected="false">
                    Base64 to File
                </button>
            </li>
        </ul>
    </div>
    
    <!-- Tab content -->
    <div id="base64TabContent">
        <!-- Text to Base64 -->
        <div class="block tab-pane" id="text-encode" role="tabpanel">
            <form hx-post="/base64/encode" hx-target="#result-container" class="bg-white p-6 rounded-lg shadow-md">
                <div class="mb-4">
                    <label for="encode-text" class="block text-sm font-medium mb-2">Text to encode</label>
                    <textarea id="encode-text" name="text" rows="6" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter text to encode to Base64"></textarea>
                </div>
                <div class="mb-4">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="urlSafe" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-sm text-gray-700">Use URL-safe Base64</span>
                    </label>
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Encode to Base64
                </button>
            </form>
        </div>
        
        <!-- Base64 to Text -->
        <div class="hidden tab-pane" id="text-decode" role="tabpanel">
            <form hx-post="/base64/decode" hx-target="#result-container" class="bg-white p-6 rounded-lg shadow-md">
                <div class="mb-4">
                    <label for="decode-text" class="block text-sm font-medium mb-2">Base64 to decode</label>
                    <textarea id="decode-text" name="text" rows="6" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter Base64 string to decode"></textarea>
                </div>
                <div class="mb-4">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="urlSafe" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-sm text-gray-700">Input is URL-safe Base64</span>
                    </label>
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Decode from Base64
                </button>
            </form>
        </div>
        
        <!-- File to Base64 -->
        <div class="hidden tab-pane" id="file-encode" role="tabpanel">
            <form hx-post="/base64/encode-file" hx-target="#result-container" hx-encoding="multipart/form-data" class="bg-white p-6 rounded-lg shadow-md">
                <div class="mb-4">
                    <label for="encode-file" class="block text-sm font-medium mb-2">File to encode</label>
                    <input type="file" id="encode-file" name="file" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p class="mt-1 text-sm text-gray-500">Maximum file size: 5MB</p>
                </div>
                <div class="mb-4">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="urlSafe" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-sm text-gray-700">Use URL-safe Base64</span>
                    </label>
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Encode File to Base64
                </button>
            </form>
        </div>
        
        <!-- Base64 to File -->
        <div class="hidden tab-pane" id="file-decode" role="tabpanel">
            <form hx-post="/base64/decode-file" hx-target="_blank" class="bg-white p-6 rounded-lg shadow-md">
                <div class="mb-4">
                    <label for="decode-file-base64" class="block text-sm font-medium mb-2">Base64 string</label>
                    <textarea id="decode-file-base64" name="text" rows="6" 
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter Base64 string to convert to file"></textarea>
                </div>
                <div class="mb-4">
                    <label for="file-name" class="block text-sm font-medium mb-2">Output file name (optional)</label>
                    <input type="text" id="file-name" name="fileName" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="e.g., decoded_image.jpg">
                </div>
                <div class="mb-4">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="urlSafe" class="form-checkbox h-5 w-5 text-blue-600">
                        <span class="ml-2 text-sm text-gray-700">Input is URL-safe Base64</span>
                    </label>
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Download File
                </button>
            </form>
        </div>
    </div>
    
    <!-- Results container -->
    <div id="result-container" class="mt-8"></div>
</div>

<!-- Tab switching script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('[data-tab]');
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get target tab ID
            const targetId = button.getAttribute('data-tab');
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.add('hidden');
                pane.classList.remove('block');
            });
            
            // Show target tab pane
            const targetPane = document.getElementById(targetId);
            targetPane.classList.add('block');
            targetPane.classList.remove('hidden');
            
            // Update tab button states
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-600', 'text-blue-600');
                btn.classList.add('border-transparent');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Set active tab button
            button.classList.add('border-blue-600', 'text-blue-600');
            button.classList.remove('border-transparent');
            button.setAttribute('aria-selected', 'true');
        });
    });
});
</script>
</@page>