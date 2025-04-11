<footer class="bg-gray-800 text-white mt-auto">
    <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- About Section -->
            <div>
                <h3 class="text-lg font-semibold mb-3">About ToolChest</h3>
                <p class="text-gray-400 text-sm">
                    ToolChest offers free utility tools for everyday tasks. No account required, no data collection, just useful tools.
                </p>
            </div>
            
            <!-- Popular Tools -->
            <div>
                <h3 class="text-lg font-semibold mb-3">Popular Tools</h3>
                <ul class="text-gray-400 text-sm space-y-2">
                    <li><a href="/tools/base64" class="hover:text-white transition-colors duration-200">Base64 Encoder/Decoder</a></li>
                    <li><a href="/tools/json-formatter" class="hover:text-white transition-colors duration-200">JSON Formatter</a></li>
                    <li><a href="/tools/image-compressor" class="hover:text-white transition-colors duration-200">Image Compressor</a></li>
                    <li><a href="/tools/password-generator" class="hover:text-white transition-colors duration-200">Password Generator</a></li>
                </ul>
            </div>
            
            <!-- Categories -->
            <div>
                <h3 class="text-lg font-semibold mb-3">Categories</h3>
                <ul class="text-gray-400 text-sm space-y-2">
                    <li><a href="/category/encoders-decoders" class="hover:text-white transition-colors duration-200">Encoders/Decoders</a></li>
                    <li><a href="/category/formatters" class="hover:text-white transition-colors duration-200">Formatters</a></li>
                    <li><a href="/category/converters" class="hover:text-white transition-colors duration-200">Converters</a></li>
                    <li><a href="/category/generators" class="hover:text-white transition-colors duration-200">Generators</a></li>
                </ul>
            </div>
            
            <!-- Legal & Info -->
            <div>
                <h3 class="text-lg font-semibold mb-3">Legal & Info</h3>
                <ul class="text-gray-400 text-sm space-y-2">
                    <li><a href="/privacy" class="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                    <li><a href="/terms" class="hover:text-white transition-colors duration-200">Terms of Service</a></li>
                    <li><a href="/contact" class="hover:text-white transition-colors duration-200">Contact Us</a></li>
                </ul>
            </div>
        </div>
        
        <!-- Separator -->
        <hr class="border-gray-700 my-6">
        
        <!-- Copyright & Social -->
        <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-gray-400 text-sm">
                &copy; ${.now?string('yyyy')} ToolChest. All rights reserved.
            </div>
            
            <!-- Social Links -->
            <div class="flex space-x-4 mt-4 md:mt-0">
                <a href="https://twitter.com/toolchest" class="hover:text-blue-400 transition-colors duration-200">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="https://github.com/toolchest" class="hover:text-gray-300 transition-colors duration-200">
                    <i class="fab fa-github"></i>
                </a>
                <a href="https://linkedin.com/company/toolchest" class="hover:text-blue-500 transition-colors duration-200">
                    <i class="fab fa-linkedin"></i>
                </a>
            </div>
        </div>
    </div>
</footer>