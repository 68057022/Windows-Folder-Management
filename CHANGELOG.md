# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

English | [简体中文](./CHANGELOG_CN.md)

## [1.0.0] - 2025-10-17

### Added
- Initial release of Project Management System
- Project lifecycle management (To-Do, Delivered, Needs Modification)
- Workspace selection and persistence
- Batch import of existing project folders
- File attachment support with drag-and-drop
- Image paste from clipboard (Ctrl+V)
- Project search and filtering capabilities
- Sorting by creation time, modification time, and deadline
- Dashboard with project statistics
- Project list view with detailed information
- Modern and professional UI design
- Persistent data storage with configurable location
- Installation wizard for first-time setup

### Technical
- Built with Electron 29.x
- Vue 3 with Composition API
- TypeScript for type safety
- Element Plus UI components
- Pinia for state management
- File-based data storage with JSON

### Fixed
- Workspace path persistence across application restarts
- Data migration from old storage format
- File system operations for cross-platform compatibility

