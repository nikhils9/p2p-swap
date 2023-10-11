import { CREDENTIALS_PATH } from "../../common/constants.ts";
import { lucid } from "./utils.ts";

// Credentials related utilities

export async function generateNewWallet(
  walletName: string,
  walletPath?: string,
) {
  let path = CREDENTIALS_PATH;
  if (walletPath) {
    path = walletPath;
  }

  const privateKey = lucid.utils.generatePrivateKey();
  await Deno.writeTextFile(path + walletName + ".sk", privateKey);

  const address = await lucid.selectWalletFromPrivateKey(privateKey).wallet
    .address();
  await Deno.writeTextFile(path + walletName + ".addr", address);
}

export async function getCredential(fileName: string, filePath?: string) {
  let path = CREDENTIALS_PATH;

  if (filePath) {
    path = filePath;
  }

  return await Deno.readTextFile(path + fileName);
}

export function getPublicKeyHash(address: string) {
  return lucid.utils.getAddressDetails(address).paymentCredential?.hash!;
}
