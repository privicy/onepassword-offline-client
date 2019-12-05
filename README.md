# OnePassword Offline Client

## Class Hierarchy

### Methods

- [constructor](README.md#constructor)
- [addEntry](README.md#addentry)
- [getEntries](README.md#getentries)
- [getEntryCredentials](README.md#getentrycredentials)
- [login](README.md#login)

## Methods

### constructor

▸ **constructor**(`dbPath`: string): void\_

**Returns:** _void_

---

### addEntry

▸ **addEntry**(`entry`: [NewEntry]): _boolean_

**Parameters:**

| Name    | Type       |
| ------- | ---------- |
| `entry` | [NewEntry] |

**Returns:** _boolean_

---

### getEntries

▸ **getEntries**(): _[Entry]_

**Returns:** _[Entry]_

---

### getEntryCredentials

▸ **getEntryCredentials**(`entryId`: string): _[EntryCredentials]_

**Returns:** _[EntryCredentials]_

---

### login

▸ **login**(`password`: string, `username`: string, `secret`: string): _void_

**Parameters:**

| Name       | Type   |
| ---------- | ------ |
| `password` | string |
| `username` | string |
| `secret`   | string |

**Returns:** _void_

## Type aliases

### NewEntry

Ƭ **NewEntry**: _Record‹[NewEntryFields](README.md#rawentryfields), string›_

---

### NewEntryFields

Ƭ **NewEntryFields**: \_"id" | "name" | "url" | "type" | "username" | "password" | "otp"

---

### Entry

Ƭ **Entry**: _Record‹[EntryFields](README.md#entryfields), string›_

---

### EntryFields

Ƭ **EntryFields**: \_"id" | "name" | "url" | "type"

---

### EntryCredentials

Ƭ **EntryCredentials**: _Record‹[EntryCredentialsFields](README.md#entrycredentialsfields), string›_

---

### EntryCredentialsFields

Ƭ **EntryCredentialsFields**: \_"username" | "password" | "otp";

---
