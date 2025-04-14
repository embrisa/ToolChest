<#-- Import the macros.ftl file to access the page macro -->
<#import "/macros.ftl" as layout>

<@layout.page 
  title="About Us"
  pageDescription="Learn more about ToolChest and our mission to provide free, useful tools."
>
<div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">About ToolChest</h1>
    
    <div class="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
        <p class="text-gray-700 mb-4">
            ToolChest is dedicated to providing free, high-quality utility tools that are accessible to everyone.
            We believe in simplicity, ease of use, and respecting your privacy. Our collection of tools is designed 
            to help you with everyday tasks without requiring registration or collecting unnecessary personal data.
        </p>
        <p class="text-gray-700">
            All our tools are completely free to use with no hidden costs or limitations. We maintain these tools 
            through minimal, non-intrusive advertisements that help cover our operational costs.
        </p>
    </div>
    
    <div class="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4">Our Tools</h2>
        <p class="text-gray-700 mb-4">
            We're constantly working to expand our collection of tools. Currently, we offer:
        </p>
        <ul class="list-disc ml-6 mb-4 text-gray-700">
            <li class="mb-2"><strong>Base64 Encoder/Decoder:</strong> Convert text and files to and from Base64 format</li>
            <li class="mb-2"><strong>More tools coming soon!</strong> We're working on adding new utilities regularly</li>
        </ul>
        <p class="text-gray-700">
            Have a suggestion for a tool you'd like to see? Feel free to contact us with your ideas.
        </p>
    </div>
    
    <div class="bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">Contact Us</h2>
        <p class="text-gray-700 mb-4">
            We value your feedback and suggestions. If you have any questions, concerns, or ideas for new tools, 
            please don't hesitate to reach out to us.
        </p>
        <p class="text-gray-700">
            Email: <a href="mailto:contact@toolchest.example.com" class="text-blue-600 hover:text-blue-800">contact@toolchest.example.com</a>
        </p>
    </div>
</div>
</@layout.page>