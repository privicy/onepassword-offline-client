import base64safe from "urlsafe-base64";
import { flatten, find } from "lodash";
import NodeRSA from "node-rsa";
import { Cipher } from "./services/Cipher";
import { Onepassword } from "./services/Onepassword";
import {
  Client,
  Entry,
  DecryptedItemOverview,
  DecryptedItemDetail,
  RawEntry,
  EntryCredentials
} from "./types";
import { extractOtp, getKey } from "./utilities";

export default class OnepasswordClient implements Client {
  private cipher: Cipher;
  private onepassword: Onepassword;
  private masterKeys: Record<string, NodeRSA>;

  public constructor(dbPath: string) {
    this.cipher = new Cipher();
    this.onepassword = new Onepassword(dbPath);
  }

  public login(password: string, email: string, secret: string): void {
    this.cipher.setAuth({ password, email });
    this.cipher.setKey(getKey(secret));
    const keysets = this.onepassword.getKeySets();
    this.masterKeys = this.cipher.getMasterPrivateKeys(keysets);
  }

  public getEntries(): Entry[] {
    const vaults = this.onepassword.getVaults();
    const entries = vaults.map(({ uuid, encVaultKey }) => {
      const { k } = this.cipher.decipher(
        encVaultKey,
        this.masterKeys[encVaultKey.kid]
      );
      const vaultKey = base64safe.decode(k);
      const items = this.onepassword.getItemsOverview(uuid);
      return items.map(({ encOverview, uuid: itemId }) => {
        const { url, title, tags, ainfo } = this.cipher.decipher(
          encOverview,
          vaultKey
        ) as DecryptedItemOverview;
        return {
          id: `${uuid}:${itemId}`,
          url: url,
          name: title,
          type: tags && tags.length ? tags[0] : null,
          username: ainfo
        };
      });
    });
    return flatten(entries);
  }

  public getEntryCredentials(id: string): EntryCredentials {
    const [vaultID, uuid] = id.split(":");
    const vaults = this.onepassword.getVaults();
    const { encVaultKey } = find(vaults, ["uuid", vaultID]);
    const { k: vaultKey } = this.cipher.decipher(
      encVaultKey,
      this.masterKeys[encVaultKey.kid]
    );
    const { encDetails } = this.onepassword.getItemDetail(uuid, vaultID);
    const { fields, sections } = this.cipher.decipher(
      encDetails,
      base64safe.decode(vaultKey)
    ) as DecryptedItemDetail;
    const username = find(fields, ["designation", "username"]);
    const password = find(fields, ["designation", "password"]);
    const otp = extractOtp(sections);
    return {
      username: username ? username.value : "",
      password: password ? password.value : "",
      otp
    };
  }

  public async addEntry(entry: RawEntry): Promise<void> {}
}
