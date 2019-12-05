import queryString from "querystring";
import { Key } from "./types";

export const parse = (data: any, keys: any) => {
  keys.map((key: any) => {
    data[key] = JSON.parse(data[key].toString());
  });
  return data;
};

export const extractOtp = (sections: any[]) => {
  let otp = "";
  Array.isArray(sections) &&
    sections.map(({ fields }) => {
      Array.isArray(fields) &&
        fields.map(({ n, v }: any) => {
          if (!!n.match(/TOTP/gi)) {
            const { secret = "" } = queryString.parse(v.split("?").pop());
            otp = secret as string;
          }
        });
    });
  return otp;
};

export const getKey = (secretKey: string): Key => {
  const formattedKey = secretKey.replace(/-/g, "");
  return {
    format: formattedKey.slice(0, 2),
    id: formattedKey.slice(2, 8),
    key: formattedKey.slice(8)
  };
};
