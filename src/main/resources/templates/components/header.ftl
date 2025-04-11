<header class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
            <!-- Logo and Site Name -->
            <div class="flex items-center space-x-2">
                <a href="/" class="flex items-center">
                    <i class="fas fa-toolbox text-2xl mr-2"></i>
                    <span class="text-xl font-bold">ToolChest</span>
                </a>
            </div>
            
            <!-- Navigation -->
            <nav class="hidden md:flex space-x-6">
                <a href="/" class="hover:text-blue-200 transition-colors duration-200">Home</a>
                <a href="/tools" class="hover:text-blue-200 transition-colors duration-200">All Tools</a>
                <div class="relative group">
                    <a href="#" class="hover:text-blue-200 transition-colors duration-200 flex items-center">
                        Categories
                        <i class="fas fa-chevron-down ml-1 text-xs"></i>
                    </a>
                    <div class="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div class="py-1 text-gray-800" role="menu">
                            <a href="/category/encoders-decoders" class="block px-4 py-2 hover:bg-gray-100" role="menuitem">Encoders/Decoders</a>
                            <a href="/category/formatters" class="block px-4 py-2 hover:bg-gray-100" role="menuitem">Formatters</a>
                            <a href="/category/converters" class="block px-4 py-2 hover:bg-gray-100" role="menuitem">Converters</a>
                            <a href="/category/generators" class="block px-4 py-2 hover:bg-gray-100" role="menuitem">Generators</a>
                        </div>
                    </div>
                </div>
                <a href="/about" class="hover:text-blue-200 transition-colors duration-200">About</a>
            </nav>
            
            <!-- Mobile Menu Button -->
            <div class="md:hidden">
                <button id="mobile-menu-button" class="text-white focus:outline-none">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
        
        <!-- Mobile Navigation -->
        <div id="mobile-menu" class="md:hidden hidden mt-3 pb-2">
            <div class="flex flex-col space-y-3">
                <a href="/" class="hover:text-blue-200 transition-colors duration-200">Home</a>
                <a href="/tools" class="hover:text-blue-200 transition-colors duration-200">All Tools</a>
                <details>
                    <summary class="hover:text-blue-200 transition-colors duration-200 cursor-pointer">Categories</summary>
                    <div class="pl-4 mt-2 flex flex-col space-y-2 text-sm">
                        <a href="/category/encoders-decoders" class="hover:text-blue-200">Encoders/Decoders</a>
                        <a href="/category/formatters" class="hover:text-blue-200">Formatters</a>
                        <a href="/category/converters" class="hover:text-blue-200">Converters</a>
                        <a href="/category/generators" class="hover:text-blue-200">Generators</a>
                    </div>
                </details>
                <a href="/about" class="hover:text-blue-200 transition-colors duration-200">About</a>
            </div>
        </div>
    </div>
</header>

<!-- Simple toggle script for mobile menu -->
<script>
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
</script>