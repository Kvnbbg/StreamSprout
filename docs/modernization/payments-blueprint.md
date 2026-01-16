# Payments + Ledger Blueprint

Below is a pragmatic, implementation-ready “math + system” blueprint for (1) payments, (2) transaction visibility in-app, and (3) a profitability algorithm that ties directly to a “retire at 35” financial-independence target.

---

## 1) Payments in an app: the only payment algorithm that scales

### The invariant

You do not “mark a payment as paid” because the client clicked a button.
You mark it as paid only when you receive an asynchronous confirmation (a provider webhook) and record it in your ledger.

### Core objects

- **Order / Invoice:** what the customer owes
- **PaymentAttempt:** one try to pay (card, SEPA, Apple Pay…)
- **Provider Event:** webhook payload (truth source for status)
- **Ledger Journal Entry:** accounting-grade record (double-entry)
- **Payout:** money transfer from provider to your bank (often batched)

### Payment state machine (minimal)

Use a strict state machine. Example:

- CREATED
- REQUIRES_PAYMENT_METHOD
- REQUIRES_CONFIRMATION
- PROCESSING
- SUCCEEDED
- FAILED
- CANCELED
- REFUNDED (or separate Refund entity)

Only SUCCEEDED allows fulfillment.

### Idempotency rule

Every network call and webhook must be idempotent.

- `idempotency_key = hash(order_id + amount + currency + customer_id + attempt_no)`
- Store provider event IDs and reject duplicates.

---

## 2) The math model: a ledger, not “a list of payments”

If you want reliable “money transactions” in-app, the correct model is a double-entry ledger (even if you are not doing full accounting).

### Accounts you need (minimum)

- AR (Accounts Receivable) – customer owes you
- CASH_PROVIDER – money at Stripe/PayPal (clearing account)
- BANK – money in your bank
- REVENUE
- FEES – provider fees
- REFUNDS (contra-revenue)

### Journal entry rules

Each “event” becomes a journal entry with lines:

**Invariant:**

```
sum(debit) = sum(credit)
```

#### A) When you issue an invoice (optional but clean)

Customer now owes you:

- Debit AR : amount_gross
- Credit REVENUE : amount_net (or gross if fees separate)

(If you track VAT, add VAT payable lines; I keep it minimal here.)

#### B) When payment succeeds (webhook confirmed)

Move money from receivable to provider balance:

- Debit CASH_PROVIDER : amount_gross
- Credit AR : amount_gross

#### C) When provider fee is known

Record fees (either immediately or at payout time):

- Debit FEES : fee_amount
- Credit CASH_PROVIDER : fee_amount

#### D) When provider pays out to your bank

- Debit BANK : payout_amount
- Credit CASH_PROVIDER : payout_amount

#### E) Refund

- Debit REFUNDS : refund_amount
- Credit BANK or CASH_PROVIDER : refund_amount

This gives you a perfect audit trail and makes “transactions screen” trivial and accurate.

---

## 3) “Seeing transactions in app”: running balance algorithm

### Data model (recommended)

- `journal_entries(id, timestamp, reference_type, reference_id, memo)`
- `journal_lines(entry_id, account_id, debit, credit, currency)`
- `accounts(id, name, type)`

### Running balance math

For any account:

```
balance(t) = sum(debit_i - credit_i) for i <= t
```

For the “money view”, you typically compute running balances for BANK and/or CASH_PROVIDER.

### Efficient query pattern

- Order journal lines by timestamp, entry_id, line_id
- Paginate
- Compute running balance progressively

If your DB supports window functions:

```
running_balance = sum(debit - credit) over(order by timestamp)
```

If not, compute in application code and cache daily snapshots.

### What to display to users (UX)

- Timeline grouped by day
- Each row shows: description, gross, fee, net, status (pending/posted), and balance-after
- Filters: income, fees, refunds, payouts

---

## 4) Payment implementation “algorithm” (provider-agnostic pseudocode)

### Create payment attempt

```
function startPayment(orderId, paymentMethod):
  order = loadOrder(orderId)
  assert order.status in [DRAFT, UNPAID]

  attempt = createPaymentAttempt(orderId, amount, currency, status="INIT")
  providerIntent = provider.createIntent(
      amount=order.amount,
      currency=order.currency,
      metadata={orderId, attemptId},
      idempotencyKey=attempt.idempotency_key
  )

  attempt.provider_intent_id = providerIntent.id
  attempt.status = "PENDING"
  save(attempt)

  return providerIntent.client_secret
```

### Webhook handler (the truth)

```
function handleWebhook(event):
  if event.id already processed: return 200

  switch event.type:
    case "payment_succeeded":
      attemptId = event.metadata.attemptId
      attempt = lockPaymentAttempt(attemptId)

      if attempt.status == "SUCCEEDED": return 200

      // 1) Mark attempt + order
      attempt.status = "SUCCEEDED"
      order.status = "PAID"
      save(attempt, order)

      // 2) Write ledger entry (atomic transaction)
      createJournalEntry(
        ts=event.timestamp,
        ref="PAYMENT", refId=attemptId,
        lines=[
          {account:"CASH_PROVIDER", debit: order.amount, credit:0},
          {account:"AR", debit:0, credit: order.amount}
        ]
      )

    case "fee_reported":
      fee = event.fee_amount
      createJournalEntry(lines=[
        {account:"FEES", debit: fee},
        {account:"CASH_PROVIDER", credit: fee}
      ])

    case "payout_paid":
      payout = event.payout_amount
      createJournalEntry(lines=[
        {account:"BANK", debit: payout},
        {account:"CASH_PROVIDER", credit: payout}
      ])
```

Non-negotiables: DB transaction + row lock + idempotency + webhook signature verification.

---

## 5) “Becoming more rentable” for retiring at 35: the financial math algorithm

### Step 1 — Define your Financial Independence number (FI)

Pick a conservative withdrawal rule `w` (often 3–4% depending on your risk tolerance).

```
FI = Annual Spending / w
```

Example: if annual spending is `S` and you use `w = 0.04`,
`FI = 25S`.

If you want a more conservative plan (3.5%),
`FI ≈ 28.6S`.

### Step 2 — Compute your “gap” and time horizon

Let:

- `PV` = current invested capital (not your checking account)
- `r` = expected annual real return (after inflation)
- `n` = years until 35
- `PMT` = annual contribution (from profit)

Target:

```
FV = PV(1+r)^n + PMT * ((1+r)^n - 1) / r
```

Set `FV = FI` and solve for `PMT`:

```
PMT = ((FI - PV(1+r)^n) * r) / ((1+r)^n - 1)
```

This formula tells you the profit you must reliably extract each year (after taxes, after business costs, after life expenses).

### Step 3 — Convert required contribution into business targets

Let:

- `M` = gross margin (after direct costs)
- `O` = operating expenses (tools, software, accountant, etc.)
- `T` = taxes/cotisations rate (approximate effective)
- `P` = required profit available to invest (your PMT)

Then your required revenue `R` satisfies roughly:

```
(R * M - O) * (1 - T) >= P
```

So:

```
R >= (P / (1 - T) + O) / M
```

That is the bridge between “retire at 35” and “what I must sell monthly.”

---

## 6) The weekly operating algorithm to become profitable (simple and brutal)

Every week you must do these three things, in this order:

1. Pipeline: add X qualified leads
2. Conversion: send Y offers / follow-ups
3. Cash: invoice + collect (no shame, no hesitation)

And you track only these KPIs:

- Cash collected / week
- Gross margin
- Outstanding invoices (AR aging)
- Hours sold vs hours worked (your silent killer)

---

## 7) If you want, I can turn this into your exact numbers

If you give me these 5 inputs, I will compute your required monthly contribution and the corresponding revenue target:

1. Your age today (or years to 35)
2. Your target monthly spending at “retirement”
3. Your current investable capital (even small)
4. Your realistic net margin on services (approx %)
5. Your expected real return assumption (conservative)

You will then have a concrete dashboard: “I need €X/month invested, therefore €Y/month net profit, therefore €Z/month revenue.”
