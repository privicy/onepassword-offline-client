import Database, { Database as DB } from "better-sqlite3";
import { parse } from "../utilities";
import { Keysets, EncryptedVault, EncryptedItem } from "../types";

export class Onepassword {
  private db: DB;

  constructor(path: string) {
    this.db = new Database(path);
  }

  public getKeySets(): Keysets[] {
    const keysets = this.db
      .prepare(
        "SELECT uuid, sn, encrypted_by as encryptedBy, enc_sym_key as encSymKey, enc_pri_key as encPriKey, pub_key as pubKey FROM 'keysets'"
      )
      .all();
    return keysets.map(keyset =>
      parse(keyset, ["encSymKey", "encPriKey", "pubKey"])
    );
  }

  public getVaults(): EncryptedVault[] {
    const vaults = this.db
      .prepare(
        "SELECT vaults.id as uuid, vaults.uuid as uuid, vaults.type as type, vaults.created_at as createdAt, vaults.updated_at as updatedAt, vault_access.enc_vault_key as encVaultKey FROM 'vaults' INNER JOIN vault_access ON vaults.id = vault_access.vault_id"
      )
      .all();
    return vaults.map(vault => parse(vault, ["encVaultKey"]));
  }

  public getItemsOverview(vaultId: string): EncryptedItem[] {
    const items = this.db
      .prepare(
        "SELECT items.uuid as uuid, items.overview as encOverview FROM 'items' INNER JOIN 'vaults' ON items.vault_id = vaults.id WHERE vaults.uuid = ?"
      )
      .all(vaultId);
    return items.map(item => parse(item, ["encOverview"]));
  }

  public getItemDetail(itemId: string, vaultId: string): EncryptedItem {
    const item = this.db
      .prepare(
        "SELECT items.uuid as uuid, items.overview as encOverview, items.details as encDetails FROM 'items' INNER JOIN 'vaults' ON items.vault_id = vaults.id WHERE vaults.uuid = ? AND items.uuid = ?"
      )
      .get(vaultId, itemId);
    return parse(item, ["encDetails"]);
  }
}
