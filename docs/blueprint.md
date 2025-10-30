# **App Name**: R2D2 File Validator

## Core Features:

- File Upload: Allows users to upload .txt or .csv files.
- File Validation: Validates the file structure based on defined rules for each record type (PR, etc.).
- PR Record Validation: Validates 'PR' record types ensuring they have 93 fields; flags errors if the count is incorrect.
- Unknown Record Type Detection: Identifies and flags errors for unknown record types encountered during validation.
- Result Display: Displays validation results, showing success or listing errors in a clear format.
- Error Highlighting: Highlights lines with errors for easy identification within the file.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) to evoke a sense of reliability and trust.
- Background color: Light gray (#F5F5F5) for a clean, neutral interface.
- Accent color: Subtle purple (#BDB2FF) to provide a visually distinct interactive element.
- Body and headline font: 'Inter', a sans-serif font for a modern, readable design.
- Use simple, geometric icons from Lucide to represent file types and actions.
- Card-based layout with clear sections for upload, validation, and results.
- Subtle transition animations when displaying validation results or file upload status.