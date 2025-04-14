<#-- Common Macros for Testing -->

<#-- Simple format date macro -->
<#macro formatDate date>
    ${date?string("yyyy-MM-dd")}
</#macro>

<#-- Simple format number macro -->
<#macro formatNumber number>
    ${number?string("0.##")}
</#macro> 