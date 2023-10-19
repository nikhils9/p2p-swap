use aiken/transaction.{ScriptContext, Spend}
use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/credential.{VerificationKey}
use p2p_swap/types.{SwapOrder, SwapAction, Buy, Modify, Cancel}
use p2p_swap/utils.{from_address, uncommon}
use aiken/transaction/value
use aiken/list
use assist/payout
use assist/signing

// TODO: 
// 1. Fix exploit of pay_atleast(ask) common accross multiple buys. Just paying once
// instead of paying the common ask multiple times.
// 2. Enforce one order one utxo rule
validator(marketplace: Hash<Blake2b_224, VerificationKey>) {
    fn swap(order: SwapOrder, action: SwapAction, ctx: ScriptContext) -> Bool {
        let ScriptContext(tx, purpose) = ctx
        
        when purpose is {
          Spend(out_ref) -> {
              expect Some(spending_input) = transaction.find_input(tx.inputs, out_ref)
              let script_addr = spending_input.output.address
              let seller = from_address(order.seller_addr)
              let marketplace_addr = credential.from_verification_key(marketplace)
              let fees = value.from_lovelace(2_000_000)
              let actual_bid = spending_input.output.value
              let outputs = tx.outputs
              let seller_addr = order.seller_addr

            when action is {
              Buy {bid, buyer_addr} -> {
                and {
                  (bid == actual_bid)?,
                  list.has(tx.extra_signatories, marketplace)?,
                  payout.at_least(seller_addr, order.ask, outputs)?,
                  payout.at_least(marketplace_addr, fees, outputs)?,
                  payout.at_least(buyer_addr, spending_input.output.value, outputs)?
                }
              }
              Modify{new_ask, new_bid, old_bid} -> {
                and {
                  (new_ask != order.ask)?,
                  (actual_bid == old_bid)?,
                  signing.verify_multisig(tx.extra_signatories, [seller, marketplace], 2)?,
                  payout.at_least(script_addr, new_bid, outputs)?,
                  payout.at_least(seller_addr, uncommon(actual_bid, new_bid), outputs)?
                }
              }
              Cancel{bid} -> {
                and {
                  (bid == actual_bid)?,
                  signing.verify_multisig(tx.extra_signatories, [seller, marketplace], 2)?,
                  payout.at_least(seller_addr, actual_bid, outputs)?
                }
              }
            }
          }
          _ -> False
        }
    }
}