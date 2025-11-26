# Requirements Document

## Introduction

Bu özellik, kullanıcıların Instagram API'si kullanmadan takipçi listelerini manuel olarak yükleyip, bulutta saklayabilmelerini ve zaman içindeki değişiklikleri (yeni takipçiler ve takipten çıkanlar) takip edebilmelerini sağlayan bir web uygulamasıdır.

## Glossary

- **Follower_Tracker**: Takipçi listelerini yöneten ve karşılaştıran ana sistem
- **Follower_List**: Kullanıcının yüklediği takipçi kullanıcı adları listesi
- **Snapshot**: Belirli bir zamanda yüklenen takipçi listesinin kaydı
- **Comparison_Result**: İki snapshot arasındaki farkları gösteren sonuç (yeni takipçiler, takipten çıkanlar)
- **Cloud_Storage**: Takipçi listelerinin saklandığı bulut depolama sistemi
- **User**: Uygulamayı kullanan kişi

## Requirements

### Requirement 1

**User Story:** As a user, I want to upload my Instagram follower list manually, so that I can track my followers without using Instagram API.

#### Acceptance Criteria

1. WHEN a user uploads a text file containing follower usernames THEN the Follower_Tracker SHALL parse the file and extract all valid usernames
2. WHEN a user pastes follower usernames directly into a text area THEN the Follower_Tracker SHALL accept and parse the input
3. WHEN the uploaded data contains invalid entries or empty lines THEN the Follower_Tracker SHALL filter out invalid entries and process only valid usernames
4. WHEN a follower list is successfully parsed THEN the Follower_Tracker SHALL display the total count of valid followers extracted

### Requirement 2

**User Story:** As a user, I want my follower lists to be stored in the cloud, so that I can access them from any device and keep historical records.

#### Acceptance Criteria

1. WHEN a follower list is uploaded THEN the Follower_Tracker SHALL create a timestamped snapshot and store it in Cloud_Storage
2. WHEN storing a snapshot THEN the Follower_Tracker SHALL associate the snapshot with the authenticated user account
3. WHEN a user requests their snapshot history THEN the Follower_Tracker SHALL retrieve and display all previous snapshots with timestamps
4. WHEN serializing a snapshot for storage THEN the Follower_Tracker SHALL encode the data using JSON format
5. WHEN deserializing a snapshot from storage THEN the Follower_Tracker SHALL decode the JSON and reconstruct the original snapshot data

### Requirement 3

**User Story:** As a user, I want to compare my current follower list with previous snapshots, so that I can identify who unfollowed me and who are my new followers.

#### Acceptance Criteria

1. WHEN a new follower list is uploaded and a previous snapshot exists THEN the Follower_Tracker SHALL automatically compare the two lists
2. WHEN comparing two follower lists THEN the Follower_Tracker SHALL identify all usernames present in the new list but absent in the old list as new followers
3. WHEN comparing two follower lists THEN the Follower_Tracker SHALL identify all usernames present in the old list but absent in the new list as unfollowers
4. WHEN comparison is complete THEN the Follower_Tracker SHALL display the count and list of new followers
5. WHEN comparison is complete THEN the Follower_Tracker SHALL display the count and list of unfollowers

### Requirement 4

**User Story:** As a user, I want to select specific snapshots to compare, so that I can analyze follower changes over different time periods.

#### Acceptance Criteria

1. WHEN a user has multiple snapshots THEN the Follower_Tracker SHALL allow selection of any two snapshots for comparison
2. WHEN two snapshots are selected for comparison THEN the Follower_Tracker SHALL perform the comparison and display results
3. WHEN displaying comparison results THEN the Follower_Tracker SHALL show the timestamps of both compared snapshots

### Requirement 5

**User Story:** As a user, I want to authenticate securely, so that only I can access my follower data.

#### Acceptance Criteria

1. WHEN a user attempts to access the application THEN the Follower_Tracker SHALL require authentication
2. WHEN a user provides valid credentials THEN the Follower_Tracker SHALL grant access to the user's data
3. WHEN a user provides invalid credentials THEN the Follower_Tracker SHALL deny access and display an error message
4. WHEN a user session expires THEN the Follower_Tracker SHALL require re-authentication

### Requirement 6

**User Story:** As a user, I want a clean and intuitive web interface, so that I can easily upload lists and view comparison results.

#### Acceptance Criteria

1. WHEN the application loads THEN the Follower_Tracker SHALL display a clear upload interface for follower lists
2. WHEN comparison results are available THEN the Follower_Tracker SHALL display new followers and unfollowers in separate, clearly labeled sections
3. WHEN displaying follower lists THEN the Follower_Tracker SHALL support sorting alphabetically and by date added
4. WHEN a user performs an action THEN the Follower_Tracker SHALL provide visual feedback indicating the action status

### Requirement 7

**User Story:** As a user, I want to delete my stored snapshots, so that I can manage my storage and remove outdated data.

#### Acceptance Criteria

1. WHEN a user requests to delete a snapshot THEN the Follower_Tracker SHALL remove the snapshot from Cloud_Storage
2. WHEN a snapshot is deleted THEN the Follower_Tracker SHALL update the snapshot history to reflect the deletion
3. WHEN a user requests to delete all snapshots THEN the Follower_Tracker SHALL remove all snapshots associated with the user account
