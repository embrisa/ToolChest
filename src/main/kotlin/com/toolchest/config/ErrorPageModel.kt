package com.toolchest.config

/**
 * Model class for error page data to ensure consistent error information display
 * across different error scenarios.
 */
data class ErrorPageModel(
    val errorCode: Int,
    val errorTitle: String,
    val errorMessage: String,
    val suggestedAction: String? = null,
    val showHomeLink: Boolean = true,
    val showBackLink: Boolean = true
)