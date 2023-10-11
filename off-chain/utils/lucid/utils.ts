import {
  ADA_HANDLE_POLICY_ID,
  BLOCKFROST_URL,
  NETWORK,
} from "../../common/mod.ts";
import {
  Blockfrost,
  fromText,
  Lucid,
  Network,
  Provider,
  toUnit,
  UTxO,
} from "lucid";

export const lucid = await Lucid.new(undefined, NETWORK);

export async function createLucidInstance(
  provider?: Provider,
  network?: Network,
) {
  let defaultNetwork = NETWORK;
  let defaultProvider: Provider = getBlockfrostProvider();

  if (provider) {
    defaultProvider = provider;
  }
  if (network) {
    defaultNetwork = network;
  }

  return await Lucid.new(defaultProvider, defaultNetwork);
}

// Parameter to 'JSON.stringify()' to help with bigint conversion
export function bigIntReplacer(_k: any, v: any) {
  return typeof v === "bigint" ? v.toString() : v;
}

export function getBlockfrostProvider(): Blockfrost {
  return new Blockfrost(
    BLOCKFROST_URL,
    Deno.env.get("BLOCKFROST_API_KEY"),
  );
}

export function isAdaHandle(identifier: string): boolean {
  return identifier[0] === "$";
}

export async function resolveAdaHandle(handle: string): Promise<string> {
  const handleName = handle.substring(1);

  if (handleName.length === 0) {
    throw new Error("Empty handle name!");
  }

  console.log(ADA_HANDLE_POLICY_ID + "." + fromText(handleName));

  let utxoAtAddress: UTxO;
  try {
    utxoAtAddress = await lucid.utxoByUnit(
      ADA_HANDLE_POLICY_ID + fromText(handleName),
    );
  } catch (_error) {
    //Could not resolve ADAHandle based on CIP-25. Trying with CIP-68."
    utxoAtAddress = await lucid.utxoByUnit(
      toUnit(ADA_HANDLE_POLICY_ID, fromText(handleName), 222),
    );
  }
  return utxoAtAddress.address;
}
