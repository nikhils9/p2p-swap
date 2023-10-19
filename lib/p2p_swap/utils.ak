use aiken/dict.{foldl, has_key, Dict}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction.{ScriptContext, Spend, Output}
use aiken/transaction/credential.{
  Address, ScriptCredential, VerificationKey, VerificationKeyCredential,
}
use aiken/transaction/value.{to_dict, zero, Value, PolicyId, AssetName, merge, add}
use aiken/list

// Provides the public key hash or the script hash from
// the given address.
pub fn from_address(address: Address) -> ByteArray {
  let Address {payment_credential, ..} = address
  when payment_credential is {
    VerificationKeyCredential(pub_key_hash) -> pub_key_hash
    ScriptCredential(script_hash) -> script_hash
  }
}

// Given two values, the common value between the is provided
// None if there is nothing common
pub fn common(left: Value, right: Value) -> Option<Value> {
  todo
}

// Given list of Outputs, this returns the total value of
// those values
pub fn sum_output_values(outputs: List<Output>) -> Value {
  list.foldl(outputs, zero(), fn(output, acc) {
    merge(acc, output.value)
  })
}

// Given two values, the common value between them is removed
// from the left value and returned.
pub fn uncommon(left v1: Value, right v2: Value) -> Value {
  let d1 = to_dict(v1)
  let d2 = to_dict(v2)

  foldl(
    d1,
    zero(),
    fn(pid, a1, acc) {
      when dict.get(d2, pid) is {
        Some(a2) ->
          foldl(
            a1,
            acc,
            fn(asset_name, q1, acc2) {
              when dict.get(a2, asset_name) is {
                Some(q2) ->
                  if q1 > q2 {
                    add(acc2, pid, asset_name, q1 - q2)
                  } else {
                    acc2
                  }
                None -> add(acc2, pid, asset_name, q1)
              }
            },
          )
        None -> add_tokens(acc, pid, a1)
      }
    },
  )
}

test test_uncommon_1() {
  let v1 = 
    zero()
      |> add("1","1",1)

  let v2 = 
    zero()
    |> add("2","2",1)

  uncommon(v1, v2) == v1
}

test test_uncommon_2() {
  let v1 = 
    zero()
      |> add("1","1",2)

  let v2 = 
    zero()
    |> add("1","1",1)

  uncommon(v1, v2) == v2
}

test test_uncommon_3() {
  let v1 = 
    zero()
      |> add("1","1",2)
      |> add("2","2",4)
      |> add("2","3",6)

  let v2 = 
    zero()
    |> add("1","2",1)
    |> add("2","2",2)
  
  let v3 =
   zero()
    |> add("1","1",2)
    |> add("2","2",2)
    |> add("2","3",6)

  uncommon(v1, v2) == v3
}

fn add_tokens(
  v: Value,
  policy_id: PolicyId,
  tokens: Dict<AssetName, Int>,
) -> Value {
  foldl(
    tokens,
    v,
    fn(asset_name, quantity, acc) { add(acc, policy_id, asset_name, quantity) },
  )
}

fn fold_policies(
  pid: PolicyId,
  assets: Dict<AssetName, Int>,
  acc: Value,
) -> Value {
  let d2 = dict.new()

  when dict.get(d2, pid) is {
    Some(assets) -> foldl(assets, acc, fold_assets)
    None -> acc
  }
}

fn fold_assets(asset_name: AssetName, quantity: Int, acc: Value) -> Value {
  let a2 = dict.new()
  let pid = "test"

  when dict.get(a2, asset_name) is {
    Some(q2) ->
      if quantity > q2 {
        add(acc, pid, asset_name, quantity - q2)
      } else {
        acc
      }
    None -> acc
  }
}
