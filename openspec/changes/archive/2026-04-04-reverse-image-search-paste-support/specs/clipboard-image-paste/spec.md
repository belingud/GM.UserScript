## ADDED Requirements

### Requirement: Clipboard image paste option
The system SHALL provide a "Paste Image" option alongside existing image source options (Select File, Paste URL, Click Image).

#### Scenario: User clicks paste image button with image in clipboard
- **WHEN** user clicks "Paste Image" button
- **THEN** system reads image data from clipboard using `navigator.clipboard.read()`
- **AND** system displays loading indicator during clipboard read

#### Scenario: User clicks paste image button without image in clipboard
- **WHEN** user clicks "Paste Image" button
- **AND** clipboard contains no image data
- **THEN** system displays toast message indicating no image found in clipboard

#### Scenario: User denies clipboard permission
- **WHEN** user clicks "Paste Image" button
- **AND** user denies clipboard read permission
- **THEN** system displays toast message requesting permission

### Requirement: Clipboard image upload
The system SHALL upload clipboard image to tmpfiles.org and convert it to a search URL.

#### Scenario: Successful clipboard image upload
- **WHEN** clipboard image is successfully read
- **THEN** system uploads the image to tmpfiles.org
- **AND** system stores the returned URL as `imageSrc`
- **AND** system marks "Paste Image" option as selected

#### Scenario: Upload failure
- **WHEN** clipboard image upload to tmpfiles.org fails
- **THEN** system displays error toast with localized message
- **AND** system does not update `imageSrc`
