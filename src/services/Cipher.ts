import {
  pbkdf2Sync,
  createDecipheriv,
  createCipheriv,
  randomBytes
} from "crypto";
import base64safe from "urlsafe-base64";
import NodeRSA from "node-rsa";
import hkdf from "futoin-hkdf";
import xor from "buffer-xor";
import { Key, Auth, Keysets, EncryptedPayload } from "../types";

export class Cipher {
  private key: Key;
  private auth: Auth;

  public setAuth(auth: Auth): void {
    this.auth = auth;
  }

  public setKey(key: Key): void {
    this.key = key;
  }

  public getMasterPrivateKeys(encKeysets: Keysets[]): Record<string, NodeRSA> {
    return encKeysets.reduce(
      (acc: any, { encSymKey, encPriKey, encryptedBy, uuid }) => {
        const symKey =
          encryptedBy === "mp"
            ? this.decipher(encSymKey, this.deriveMasterUnlockKey(encSymKey))
            : JSON.parse(
                (acc[encryptedBy] as NodeRSA).decrypt(encSymKey.data).toString()
              );
        acc[uuid] = this.formatPrivateKey(
          this.decipher(encPriKey, base64safe.decode(symKey.k))
        );
        return acc;
      },
      {}
    );
  }

  public decipher(payload: EncryptedPayload, key: NodeRSA | Buffer) {
    const data = base64safe.decode(payload.data);
    switch (payload.enc) {
      case "A256GCM": {
        const iv = base64safe.decode(payload.iv);
        const decipher = createDecipheriv("aes-256-gcm", key as Buffer, iv);
        decipher.setAuthTag(data.slice(-16));
        let plainText = decipher.update(data.slice(0, -16), null, "utf8");
        plainText += decipher.final("utf8");
        return JSON.parse(plainText);
      }
      case "RSA-OAEP":
        return JSON.parse((key as NodeRSA).decrypt(data).toString());
      default:
        throw new Error("Unknown encryption method.");
    }
  }

  public cipher(payload: string, { key, id }: any): EncryptedPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    let data = cipher.update(payload, "utf8", "hex");
    data += cipher.final("hex");
    data += cipher.getAuthTag().toString("hex");
    return {
      kid: id,
      enc: "A256GCM",
      cty: "b5+jwk+json",
      iv: base64safe.encode(iv),
      data: base64safe.encode(Buffer.from(data, "hex"))
    };
  }

  private deriveMasterUnlockKey(encSymKey: any): Buffer {
    const salt = base64safe.decode(encSymKey.p2s);
    const iterations = encSymKey.p2c;
    const username = Buffer.from(this.auth.email);
    const password = Buffer.from(this.auth.password);
    const key = Buffer.from(this.key.key);
    const keyFormat = Buffer.from(this.key.format);
    const keyID = Buffer.from(this.key.id);
    const method = Buffer.from(encSymKey.alg);
    const key1 = hkdf(salt, 32, {
      salt: username,
      info: method,
      hash: "sha-256"
    });
    const key2 = pbkdf2Sync(password, key1, iterations, 32, "sha256");
    const key3 = hkdf(key, 32, {
      info: keyFormat,
      salt: keyID,
      hash: "sha-256"
    });
    return xor(key3, key2);
  }

  private formatPrivateKey(key: any): NodeRSA {
    const asymkey = new NodeRSA();
    asymkey.importKey(
      {
        n: base64safe.decode(key.n),
        e: base64safe.decode(key.e),
        d: base64safe.decode(key.d),
        p: base64safe.decode(key.p),
        q: base64safe.decode(key.q),
        dmp1: base64safe.decode(key.dp),
        dmq1: base64safe.decode(key.dq),
        coeff: base64safe.decode(key.qi)
      },
      "components"
    );

    return asymkey;
  }
}
