use aiken/transaction/credential.{Address}
use aiken/transaction/value.{Value}

// Datum type for containing the Swap Order
pub type SwapOrder {
  ask: Value,
  seller_addr: Address,
}

// Redeemer type for specifying the Swap Action
pub type SwapAction {
  Buy {bid: Value, buyer_addr: Address}
  Modify { new_ask: Value, new_bid: Value, old_bid: Value }
  Cancel {bid: Value}
}
