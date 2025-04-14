package com.toolchest

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.transactions.transaction

/**
 * Utility object for database-related testing functions
 */
object DatabaseTestUtils {
    /**
     * Initialize an H2 in-memory database for testing
     * 
     * @param dbName Optional database name (useful when running multiple tests in parallel)
     * @return The Database connection instance
     */
    fun initH2Database(dbName: String = "test"): Database {
        return Database.connect(
            url = "jdbc:h2:mem:$dbName;DB_CLOSE_DELAY=-1", 
            driver = "org.h2.Driver"
        )
    }
    
    /**
     * Create database schema for the specified tables
     * 
     * @param tables The tables to create in the database
     */
    fun createSchema(vararg tables: Table) {
        transaction {
            SchemaUtils.create(*tables)
        }
    }
    
    /**
     * Drop database schema for the specified tables
     * 
     * @param tables The tables to drop from the database
     */
    fun dropSchema(vararg tables: Table) {
        transaction {
            SchemaUtils.drop(*tables)
        }
    }
    
    /**
     * Execute code within a database transaction
     * 
     * @param block The code to execute in the transaction
     * @return The result of the transaction block
     */
    fun <T> withTransaction(block: () -> T): T {
        return transaction {
            block()
        }
    }
    
    /**
     * Setup and teardown database for a test
     * This helper manages the full lifecycle of a test database
     * 
     * @param tables Tables to create and drop
     * @param testBlock Code to execute between setup and teardown
     */
    fun <T> withTestDatabase(vararg tables: Table, testBlock: () -> T): T {
        // Setup
        initH2Database()
        createSchema(*tables)
        
        try {
            // Run test
            return testBlock()
        } finally {
            // Teardown
            dropSchema(*tables)
        }
    }
} 