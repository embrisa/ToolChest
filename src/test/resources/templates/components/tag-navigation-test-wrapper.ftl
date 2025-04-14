<#-- Import the actual macro template -->
<#import "/components/tag-navigation.ftl" as tagNavTemplate>

<#-- Call the macro with the provided tag data using named parameters -->
<@tagNavTemplate.tagNavigation allTags=allTags currentTag=currentTag />