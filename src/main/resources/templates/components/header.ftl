<header class="bg-gradient-to-r from-blue-500 to-violet-900 text-white shadow-md">
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
            <!-- Logo and Site Name -->
            <div class="flex items-center space-x-2">
                <a href="/" class="flex items-center group">
                    <i class="fas fa-toolbox text-2xl mr-2 group-hover:scale-110 transition-transform duration-200"></i>
                    <span class="text-xl font-bold">ToolChest</span>
                </a>
            </div>
            
            <!-- Navigation -->
            <nav class="hidden md:flex space-x-6">
                <a href="/" class="hover:text-blue-200 transition-colors duration-200 font-medium">Home</a>
                <a href="/about" class="hover:text-blue-200 transition-colors duration-200 font-medium">About</a>
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