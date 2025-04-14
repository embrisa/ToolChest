<#-- Import the actual macro template -->
<#import "/components/tool-card.ftl" as toolCardTemplate>

<#-- Call the macro with the provided tool data using named parameters -->
<@toolCardTemplate.toolCard tool=tool />