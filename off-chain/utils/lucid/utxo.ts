import { addAssets, Assets, UTxO } from "lucid";
import { bigIntReplacer } from "./utils.ts";

// UTxOs related utilities

export function sumUtxos(utxos: UTxO[]): Assets {
  return utxos
    .map((utxo) => utxo.assets)
    .reduce((acc, assets) => addAssets(acc, assets), {});
}

/// Returns the first UTxO containing equal to or greater than the asset value provided
export function getUtxoWithAssets(utxos: UTxO[], minAssets: Assets): UTxO {
  const utxo = utxos.find((utxo) => {
    for (const [unit, value] of Object.entries(minAssets)) {
      if (
        !Object.hasOwn(utxo.assets, unit) || utxo.assets[unit] < value
      ) {
        return false;
      }
    }
    return true;
  });

  if (!utxo) {
    throw new Error(
      "No UTxO found containing assets: " +
        JSON.stringify(minAssets, bigIntReplacer),
    );
  }
  return utxo;
}
