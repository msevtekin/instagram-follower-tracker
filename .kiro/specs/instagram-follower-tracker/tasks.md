# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - [x] 1.1 Initialize monorepo with frontend (React + Vite) and backend (Node.js + Express + TypeScript)
    - Create package.json files for both projects
    - Configure TypeScript for both frontend and backend
    - Set up ESLint and Prettier
    - _Requirements: 6.1_
  - [x] 1.2 Set up Firebase project and configuration
    - Create Firebase project
    - Configure Firestore database
    - Set up Firebase Authentication
    - Create firebase config files for both frontend and backend
    - _Requirements: 2.1, 5.1_
  - [x] 1.3 Install testing dependencies
    - Install Jest for unit testing
    - Install fast-check for property-based testing
    - Configure test scripts
    - _Requirements: All_

- [ ] 2. Implement core parsing service

  - [x] 2.1 Create FollowerParser service with username validation



    - Implement validateUsername function (Instagram rules: alphanumeric, underscore, period, 1-30 chars)
    - Implement parse function for text input
    - Implement parseFile function for file content
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 2.2 Write property tests for FollowerParser
    - **Property 1: Parsing extracts all valid usernames**
    - **Property 2: Invalid entries are filtered**
    - **Property 3: Count matches parsed list length**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
  - [ ]* 2.3 Write unit tests for FollowerParser edge cases
    - Test empty input
    - Test various separators (newline, comma, space)
    - Test maximum username length
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement list comparison service
  - [x] 3.1 Create ListComparator service


    - Implement compare function that returns ComparisonResult
    - Implement findNewFollowers (set difference: newList - oldList)
    - Implement findUnfollowers (set difference: oldList - newList)
    - _Requirements: 3.2, 3.3_
  - [ ]* 3.2 Write property tests for ListComparator
    - **Property 5: New followers identification**
    - **Property 6: Unfollowers identification**
    - **Property 7: Comparison symmetry**
    - **Validates: Requirements 3.2, 3.3**
  - [ ]* 3.3 Write unit tests for ListComparator
    - Test with empty lists
    - Test with identical lists
    - Test with completely different lists
    - _Requirements: 3.2, 3.3_

- [ ] 4. Implement data models and serialization
  - [x] 4.1 Create Snapshot model with serialization methods


    - Define Snapshot interface
    - Implement toJSON serialization
    - Implement fromJSON deserialization
    - _Requirements: 2.4, 2.5_
  - [ ]* 4.2 Write property test for Snapshot serialization
    - **Property 4: Snapshot serialization round-trip**
    - **Validates: Requirements 2.4, 2.5**
  - [x] 4.3 Create ComparisonResult model


    - Define ComparisonResult interface
    - Include snapshot metadata (id, timestamp, count)
    - _Requirements: 3.4, 3.5, 4.3_

- [x] 5. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement snapshot repository
  - [x] 6.1 Create SnapshotRepository with Firestore integration


    - Implement create method (store snapshot with timestamp)
    - Implement getById method
    - Implement getAllByUser method
    - Implement delete method
    - Implement deleteAllByUser method
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3_
  - [ ]* 6.2 Write property tests for SnapshotRepository
    - **Property 9: Snapshot deletion removes from storage**
    - **Property 10: Delete all removes all user snapshots**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [ ]* 6.3 Write unit tests for SnapshotRepository
    - Test CRUD operations
    - Test user isolation
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Implement backend API endpoints
  - [x] 7.1 Create authentication middleware


    - Verify Firebase ID tokens
    - Extract user ID from token
    - Handle authentication errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 7.2 Implement snapshot API routes


    - POST /api/snapshots - Create new snapshot
    - GET /api/snapshots - Get all user snapshots
    - GET /api/snapshots/:id - Get specific snapshot
    - DELETE /api/snapshots/:id - Delete snapshot
    - DELETE /api/snapshots - Delete all snapshots
    - _Requirements: 2.1, 2.3, 7.1, 7.3_
  - [x] 7.3 Implement comparison API route


    - POST /api/compare - Compare two snapshots
    - Return ComparisonResult with new followers and unfollowers
    - _Requirements: 3.1, 4.2_
  - [ ]* 7.4 Write integration tests for API endpoints
    - Test authentication flow
    - Test snapshot CRUD operations
    - Test comparison endpoint
    - _Requirements: All API requirements_

- [x] 8. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement frontend authentication
  - [x] 9.1 Create AuthContext and authentication hooks


    - Set up Firebase Auth provider
    - Implement useAuth hook
    - Handle login/logout state
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 9.2 Create Login/Register components


    - Email/password authentication form
    - Error message display
    - Loading states
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 9.3 Implement protected routes


    - Redirect unauthenticated users to login
    - Handle session expiry
    - _Requirements: 5.1, 5.4_

- [ ] 10. Implement frontend upload functionality
  - [x] 10.1 Create UploadComponent with file and text input


    - File upload with drag & drop
    - Text area for paste input
    - File type validation
    - _Requirements: 1.1, 1.2_
  - [x] 10.2 Implement upload service and API integration


    - Parse input on frontend
    - Send to backend API
    - Handle upload success/error
    - Display follower count after upload
    - _Requirements: 1.1, 1.2, 1.4, 2.1_

- [ ] 11. Implement frontend comparison and history
  - [x] 11.1 Create HistoryComponent for snapshot management


    - Display snapshot list with timestamps
    - Snapshot selection for comparison
    - Delete snapshot functionality
    - _Requirements: 2.3, 4.1, 7.1, 7.2_
  - [x] 11.2 Create ComparisonComponent for displaying results


    - New followers section with count and list
    - Unfollowers section with count and list
    - Snapshot timestamps display
    - _Requirements: 3.4, 3.5, 4.3_
  - [x] 11.3 Implement sorting functionality


    - Alphabetical sorting
    - Sort by date added
    - _Requirements: 6.3_
  - [ ]* 11.4 Write property test for sorting
    - **Property 8: Alphabetical sorting correctness**
    - **Validates: Requirements 6.3**

- [ ] 12. Implement main application layout and navigation
  - [x] 12.1 Create main App layout with navigation


    - Header with user info and logout
    - Navigation between upload, history, and comparison views
    - Responsive design
    - _Requirements: 6.1, 6.2_
  - [x] 12.2 Add loading states and visual feedback


    - Loading spinners for async operations
    - Success/error toast notifications
    - Action confirmation dialogs
    - _Requirements: 6.4_


- [x] 13. Final Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
