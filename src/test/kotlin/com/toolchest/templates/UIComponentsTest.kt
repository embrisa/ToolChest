package com.toolchest.templates

import com.toolchest.configureApplicationForTests
import com.toolchest.configureFreeMarkerForTests
import com.toolchest.data.dto.TagDTO
import com.toolchest.data.dto.ToolDTO
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.freemarker.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import org.jsoup.Jsoup

class UIComponentsTest : StringSpec({
    
    "tag navigation should display all tags with the current tag highlighted" {
        testApplication {
            // For UI component tests, we need to use configureFreeMarkerForTests directly
            // instead of configureApplicationForTests, to avoid duplicate route registration
            application {
                configureFreeMarkerForTests()
                
                // Configure test routes that use the tag navigation component
                routing {
                    get("/test-tag-nav") {
                        val allTags = listOf(
                            TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6"),
                            TagDTO(2, "Conversion", "conversion", "Conversion tools", "#10B981"),
                            TagDTO(3, "Formatting", "formatting", "Formatting tools", "#EF4444")
                        )
                        val currentTag = allTags[0]

                        // Debug output
                        application.log.info("Rendering tag navigation with ${allTags.size} tags")

                        call.respond(
                            FreeMarkerContent(
                                "test/test-tag-navigation.ftl",
                                mapOf("allTags" to allTags, "currentTag" to currentTag)
                            )
                        )
                    }
                }
            }

            // Execute request
            val response = client.get("/test-tag-nav")

            // Verify response status
            response.status shouldBe HttpStatusCode.OK

            // Parse response and check content
            val html = response.bodyAsText()

            val document = Jsoup.parse(html)

            // Verify tag navigation contains all tags
            val tagLinks = document.select("a[href^='/tag/']")
            withClue("Tag navigation should contain 3 tags") {
                tagLinks.size shouldBe 3
            }

            // Verify current tag is highlighted
            val activeTag = document.select("a[href='/tag/encoding']")
            withClue("Active tag should have background color class") {
                activeTag.attr("class").contains("bg-").shouldBeTrue()
            }

            // Verify other tags are not highlighted
            val inactiveTags = document.select("a[href='/tag/conversion'], a[href='/tag/formatting']")
            withClue("Inactive tags should not have active class") {
                inactiveTags.all { !it.attr("class").contains("bg-blue") }.shouldBeTrue()
            }
        }
    }

    "tool card should display tool info with associated tags" {
        testApplication {
            // For UI component tests, we need to use configureFreeMarkerForTests directly
            application {
                configureFreeMarkerForTests()
                
                // Configure test route that uses the tool card component with tags
                routing {
                    get("/test-tool-card") {
                        val tags = listOf(
                            TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6"),
                            TagDTO(2, "Popular", "popular", "Popular tools", "#EF4444")
                        )

                        val tool = ToolDTO(
                            id = 1,
                            name = "Base64 Encoder/Decoder",
                            slug = "base64",
                            description = "Encode or decode text and files using Base64",
                            iconClass = "fas fa-exchange-alt",
                            displayOrder = 1,
                            isActive = true,
                            tags = tags,
                            usageCount = 10
                        )

                        call.respond(
                            FreeMarkerContent(
                                "test/test-tool-card.ftl",
                                mapOf("tool" to tool)
                            )
                        )
                    }
                }
            }

            // Execute request
            val response = client.get("/test-tool-card")

            // Verify response status
            response.status shouldBe HttpStatusCode.OK

            // Parse response and check content
            val html = response.bodyAsText()
            val document = Jsoup.parse(html)

            // Verify tool card content
            withClue("Tool card should display tool name") {
                document.text() shouldContain "Base64 Encoder/Decoder"
            }
            withClue("Tool card should display tool description") {
                document.text() shouldContain "Encode or decode text"
            }

            // Verify tool tags are displayed
            val tagBadges = document.select(".tool-card .mt-2 span")
            
            withClue("Tool should display 2 tag badges") {
                tagBadges.size shouldBe 2
            }

            // Verify tag content
            val tagTexts = tagBadges.eachText()
            withClue("Tool should have Encoding tag") {
                tagTexts shouldContain "Encoding"
            }
            withClue("Tool should have Popular tag") {
                tagTexts shouldContain "Popular"
            }

            // Verify tag styling
            val encodingTag = tagBadges.find { it.text() == "Encoding" }
            encodingTag should { it != null }
            encodingTag?.let {
                withClue("Tag should have background color style") {
                    it.attr("style") shouldContain "background-color"
                }
                withClue("Tag should have text color style") {
                    it.attr("style") shouldContain "color"
                }
            }
        }
    }

    "tool grid should display multiple tools with various tag combinations" {
        testApplication {
            // For UI component tests, we need to use configureFreeMarkerForTests directly
            application {
                configureFreeMarkerForTests()
                
                // Configure test route that displays a grid of tools with various tag combinations
                routing {
                    get("/test-tool-grid") {
                        // Create test tags
                        val encodingTag = TagDTO(1, "Encoding", "encoding", "Encoding tools", "#3B82F6")
                        val conversionTag = TagDTO(2, "Conversion", "conversion", "Conversion tools", "#10B981")
                        val popularTag = TagDTO(3, "Popular", "popular", "Popular tools", "#EF4444")

                        // Create test tools with different tag combinations
                        val toolsList = listOf(
                            ToolDTO(
                                1, "Tool with 1 tag", "tool1", "Description", "fas fa-1", 1, true,
                                listOf(encodingTag), 5
                            ),
                            ToolDTO(
                                2, "Tool with 2 tags", "tool2", "Description", "fas fa-2", 2, true,
                                listOf(encodingTag, conversionTag), 10
                            ),
                            ToolDTO(
                                3, "Tool with 3 tags", "tool3", "Description", "fas fa-3", 3, true,
                                listOf(encodingTag, conversionTag, popularTag), 15
                            )
                        )

                        // Respond with tag.ftl template
                        call.respond(
                            FreeMarkerContent(
                                "pages/tag.ftl",
                                mapOf(
                                    "tag" to encodingTag,
                                    "tools" to toolsList,
                                    "allTags" to listOf(encodingTag, conversionTag, popularTag),
                                    "testMode" to true
                                )
                            )
                        )
                    }
                }
            }

            // Execute request
            val response = client.get("/test-tool-grid")

            // Verify response status
            response.status shouldBe HttpStatusCode.OK

            // Parse response
            val html = response.bodyAsText()
            val document = Jsoup.parse(html)

            // Verify all tools are displayed
            val toolCards = document.select(".tool-card")
            withClue("Should display 3 tool cards") {
                toolCards.size shouldBe 3
            }

            // Verify tool with 1 tag
            val tool1Card = toolCards.find { it.text().contains("Tool with 1 tag") }
            withClue("Tool with 1 tag should be displayed") {
                tool1Card should { it != null }
            }
            tool1Card?.let {
                withClue("Tool should display 1 tag badge") {
                    it.select(".mt-2 span").size shouldBe 1
                }
            }

            // Verify tool with 2 tags
            val tool2Card = toolCards.find { it.text().contains("Tool with 2 tags") }
            withClue("Tool with 2 tags should be displayed") {
                tool2Card should { it != null }
            }
            tool2Card?.let {
                withClue("Tool should display 2 tag badges") {
                    it.select(".mt-2 span").size shouldBe 2
                }
            }

            // Verify tool with 3 tags
            val tool3Card = toolCards.find { it.text().contains("Tool with 3 tags") }
            withClue("Tool with 3 tags should be displayed") {
                tool3Card should { it != null }
            }
            tool3Card?.let {
                withClue("Tool should display 3 tag badges") {
                    it.select(".mt-2 span").size shouldBe 3
                }
            }
        }
    }

    "empty tag results should display message and tag navigation" {
        testApplication {
            // For UI component tests, we need to use configureFreeMarkerForTests directly
            application {
                configureFreeMarkerForTests()
                
                // Configure test route for the case where a tag has no tools
                routing {
                    get("/test-empty-tag") {
                        val tag = TagDTO(1, "Empty", "empty", "Tag with no tools", "#999999")
                        val allTags = listOf(
                            tag,
                            TagDTO(2, "Other", "other", "Another tag", "#333333")
                        )

                        call.respond(
                            FreeMarkerContent(
                                "pages/tag.ftl",
                                mapOf(
                                    "tag" to tag,
                                    "tools" to emptyList<ToolDTO>(),
                                    "allTags" to allTags,
                                    "testMode" to true
                                )
                            )
                        )
                    }
                }
            }

            // Execute request
            val response = client.get("/test-empty-tag")

            // Verify response status
            response.status shouldBe HttpStatusCode.OK

            // Parse response
            val html = response.bodyAsText()
            val document = Jsoup.parse(html)

            // Verify empty state message is displayed
            withClue("Should display empty state message") {
                document.text() shouldContain "No tools found"
            }

            // Verify tag navigation is still displayed
            val tagLinks = document.select("a[href^='/tag/']")
            withClue("Tag navigation should still be displayed") {
                tagLinks.size shouldBe 2
            }
        }
    }
})