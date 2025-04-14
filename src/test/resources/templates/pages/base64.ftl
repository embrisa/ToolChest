<#import "../components/page.ftl" as layout>

<@layout.page 
    title="${title}" 
    pageDescription="${pageDescription}"
>
    <div class="tool-container">
        <h1>Base64 Encoder / Decoder</h1>
        
        <div class="tabs">
            <div class="tab">Encode Text</div>
            <div class="tab">Decode Text</div>
            <div class="tab">Encode File</div>
            <div class="tab">Decode to File</div>
        </div>
        
        <div class="tab-content">
            <form action="/base64/encode" method="post">
                <textarea name="text" placeholder="Enter text to encode"></textarea>
                <label>
                    <input type="checkbox" name="urlSafe"> URL-safe encoding
                </label>
                <button type="submit">Encode</button>
            </form>
        </div>
    </div>
</@layout.page> 