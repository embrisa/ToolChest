package com.toolchest.config

import com.toolchest.data.entities.TagEntity
import com.toolchest.data.entities.ToolEntity
import com.toolchest.data.tables.Tags
import com.toolchest.data.tables.Tools
import com.toolchest.data.tables.ToolTags
import com.toolchest.data.tables.ToolUsageStats
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.collections.shouldContain
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.ktor.server.testing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.File
import java.sql.Connection

/**
 * Extension function to check if a table exists in the database
 * Uses direct SQLite metadata mechanism for better reliability.
 */
fun tableExists(table: Table): Boolean {
    return transaction {
        try {
            val tableName = table.tableName.lowercase()
            val query = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND LOWER(name)=LOWER('$tableName');"

            // Execute query and get result
            val count = exec(query) { rs ->
                if (rs.next()) rs.getInt(1) else 0
            }

            // If count > 0, the table exists
            count?.compareTo(0) == 1
        } catch (e: Exception) {
            println("Error checking table existence: ${e.message}")
            false
        }
    }
}

class DatabaseConfigTest : FunSpec({
    val testDbFile = File("data/toolchest-db-test.db")

    beforeTest {
        // Delete test database if exists
        if (testDbFile.exists()) {
            testDbFile.delete()
        }
        testDbFile.parentFile.mkdirs()
    }

    afterTest {
        if (testDbFile.exists()) {
            testDbFile.delete()
        }
    }

    test("database tables should be created") {
        // Call the configureDatabases function with test parameters
        testApplication {
            application {
                configureDatabases(dbFilePath = testDbFile.absolutePath, seedIfEmpty = false)
            }
        }

        // Verify tables were created - ensure we connect to the actual file
        Database.connect("jdbc:sqlite:${testDbFile.absolutePath}", "org.sqlite.JDBC")

        // Print table names for debugging
        transaction {
            exec("SELECT name FROM sqlite_master WHERE type='table';") { rs ->
                val tables = mutableListOf<String>()
                while (rs.next()) {
                    tables.add(rs.getString(1))
                }
                println("Tables in database: $tables")
            }

            withClue("Tools table should exist") {
                tableExists(Tools).shouldBeTrue()
            }
            withClue("Tags table should exist") {
                tableExists(Tags).shouldBeTrue()
            }
            withClue("ToolTags table should exist") {
                tableExists(ToolTags).shouldBeTrue()
            }
            withClue("ToolUsageStats table should exist") {
                tableExists(ToolUsageStats).shouldBeTrue()
            }
        }
    }

    test("database should be seeded with initial data") {
        // Call the configureDatabases function with test parameters and enable seeding
        testApplication {
            application {
                configureDatabases(dbFilePath = testDbFile.absolutePath, seedIfEmpty = true)
            }
        }

        // Setup test database connection after seeding
        Database.connect("jdbc:sqlite:${testDbFile.absolutePath}", "org.sqlite.JDBC")

        // Verify seed data was created
        transaction {
            // Check for tags
            val tags = TagEntity.all().map { it.slug }
            withClue("Encoding tag should be seeded") {
                tags shouldContain "encoding"
            }
            withClue("Conversion tag should be seeded") {
                tags shouldContain "conversion"
            }
            withClue("Text tag should be seeded") {
                tags shouldContain "text"
            }

            // Check for Base64 tool
            val base64Tool = ToolEntity.find { Tools.slug eq "base64" }.firstOrNull()
            withClue("Base64 tool should be seeded") {
                base64Tool.shouldNotBeNull()
            }

            // Check for tool-tag relationships
            val base64Tags = base64Tool?.tags?.map { it.slug }
            withClue("Base64 tool should be tagged with 'encoding'") {
                base64Tags?.shouldContain("encoding")
            }
        }
    }

    test("seeding should be skipped when tables are not empty") {
        // Setup test database connection
        Database.connect("jdbc:sqlite:${testDbFile.absolutePath}", "org.sqlite.JDBC")

        // Create tables and add some initial data
        transaction {
            SchemaUtils.create(Tools, Tags, ToolTags, ToolUsageStats)

            // Add a custom tag that's not in the seed data
            TagEntity.new {
                name = "Custom Tag"
                slug = "custom"
                description = "A custom tag for testing"
                color = "#FF00FF"
                createdAt = System.currentTimeMillis()
            }
        }

        // Now call configureDatabases with seedIfEmpty=true, but it shouldn't seed
        testApplication {
            application {
                configureDatabases(dbFilePath = testDbFile.absolutePath, seedIfEmpty = true)
            }
        }

        // Verify our custom tag is still the only tag (no seeding happened)
        transaction {
            val tags = TagEntity.all().toList()
            withClue("No new tags should be added when tables not empty") {
                tags.size shouldBe 1
            }
            withClue("Original tag should remain") {
                tags.first().slug shouldBe "custom"
            }
        }
    }

    test("database configuration should handle errors gracefully") {
        // Test with an invalid database path
        val invalidDbPath = "/invalid/path/that/doesnt/exist/db.sqlite"

        // Should not throw exception but log error
        var exceptionCaught = false
        try {
            testApplication {
                application {
                    configureDatabases(dbFilePath = invalidDbPath, seedIfEmpty = false)
                }
            }
        } catch (e: Exception) {
            exceptionCaught = true
        }

        withClue("Database configuration should handle invalid paths gracefully") {
            exceptionCaught.shouldBeFalse()
        }
    }
})