export type EntryFields = "id" | "name" | "url" | "username" | "type";

export type Entry = Record<EntryFields, string>;

export type EntryCredentialsFields = "username" | "password" | "otp";

export type EntryCredentials = Record<EntryCredentialsFields, string>;

export type RawEntryFields = EntryFields & EntryCredentialsFields;

export type RawEntry = Entry & EntryCredentials;

export interface Client {
  login: (password: string, username?: string, secret?: string) => void;
  getEntries: () => Entry[];
  getEntryCredentials: (id: string) => EntryCredentials;
  addEntry: (account: Entry) => Promise<void>;
}

export type Device = Record<
  | "clientName"
  | "clientVersion"
  | "model"
  | "name"
  | "osName"
  | "osVersion"
  | "userAgent"
  | "uuid",
  string
>;

export type Key = Record<"format" | "id" | "key", string>;

export type Auth = {
  email: string;
  password: string;
  littleA?: string;
  bigA?: string;
  bigB?: string;
  method?: string;
  alg?: string;
  iterations?: number;
  salt?: string;
};

export type Session = Record<"id" | "key", string>;

export type Keysets = {
  encPriKey: EncryptedPayload;
  encSPriKey?: EncryptedPayload;
  encSymKey: EncryptedPayload;
  encryptedBy: string;
  pubKey: AsymettricKey;
  sn: Number;
  sPubKey?: AsymettricKey;
  uuid: string;
};

export type HttpHeaders = Record<string, string>;
export type HttpMethod = "POST" | "GET" | "PUT" | "DELETE";
export type HttpBody = Record<string, any>;

export interface HttpRequest {
  method: HttpMethod;
  body?: HttpBody;
  headers: HttpHeaders;
}

export type UserAuth = {
  method: string;
  alg: string;
  iterations: number;
  salt: string;
};

export type AuthResponse = Record<
  "status" | "sessionID" | "accountKeyFormat" | "accountKeyUuid",
  string
> &
  Record<"userAuth", UserAuth>;

export type AsymettricKey = {
  alg: string;
  ext: boolean;
  k: string;
  key_ops: string[];
  kty: string;
  kid: string;
};

export type EncryptedVault = {
  id: number;
  uuid: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  encVaultKey: EncryptedPayload;
};

export type EncryptedPayload = {
  alg?: string;
  cty: string;
  data: string;
  enc: string;
  iv?: string;
  kid: string;
  p2c?: number;
  p2s?: string;
};

export type EncryptedItem = {
  uuid: string;
  encOverview: EncryptedPayload;
  encDetails?: EncryptedPayload;
};

export type DecryptedItemOverview = {
  uuid: string;
  title: string;
  url: string;
  ainfo: string;
  ps: number;
  pbe: number;
  pgrng: boolean;
  URLs: Record<string, string>[];
  b5UserUUID: string;
  tags: string[];
};

export type DecryptedItemDetail = {
  sections: Array<{ name: string; title: string; fields: string[] }>;
  fields: Array<{
    name: string;
    value: string;
    type: string;
    designation: string;
  }>;
  notesPlain: string;
};
