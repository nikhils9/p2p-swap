import { BLOCKFROST_URL } from "../../common/constants.ts";
import { getBlockfrostProvider, lucid, sumUtxos } from "./mod.ts";
import { fromUnit, Unit } from "lucid";

export async function getAssetsWithPolicyIdAt(
  address: string,
  policyId: string,
): Promise<Unit[]> {
  const utxos = await lucid.utxosAt(address);
  lucid.selectWalletFrom({ address: address });

  const allAssets = sumUtxos(utxos);
  delete allAssets["lovelace"];
  const specificAssets: string[] = [];

  for (const unit in allAssets) {
    const asset = fromUnit(unit);
    if (asset.policyId === policyId) {
      specificAssets.push(unit);
    }
  }
  return specificAssets;
}

export async function getOnChainMetadata(unit: Unit): Promise<any> {
  const assetInfo = await getAssetInfo(unit);
  return assetInfo.onchain_metadata;
}

export async function getAssetInfo(unit: Unit): Promise<any> {
  const provider = getBlockfrostProvider();
  const info = await fetch(
    `${BLOCKFROST_URL}/assets/${unit}`,
    { headers: { project_id: provider.projectId } },
  ).then((res) => res.json());

  if (!info || info.error) {
    throw new Error("Asset infomation not found." + info.error);
  }
  return info;
}
